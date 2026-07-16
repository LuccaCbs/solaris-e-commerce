import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Package, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ActionsMenu from '../../components/ActionsMenu'
import ImageUploadField from '../../components/ImageUploadField'
import ProductImageSlider from '../../components/ProductImageSlider'
import { useDebounce } from '../../hooks/useDebounce'
import { productService } from '../../api/productService'
import { categoryService } from '../../api/categoryService'
import { productImageService, fileToBase64, ProductImage, toImageSrc } from '../../api/productImageService'
import { Product } from '../../types/product'
import { Category } from '../../types/category'

type ProductFormData = {
  name: string
  description: string
  barcode: string
  price: string
  stockQuantity: string
  categoryId: string
  ivaRate: string
  lowStockThreshold: string
  madeToOrder: boolean
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  barcode: '',
  price: '',
  stockQuantity: '',
  categoryId: '',
  ivaRate: 'GENERAL_21',
  lowStockThreshold: '',
  madeToOrder: false,
}

const uploadImages = async (productId: number, files: File[]) => {
  for (let i = 0; i < files.length; i++) {
    const base64 = await fileToBase64(files[i])
    await productImageService.upload(productId, base64, i)
  }
}

const ProductManagementPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const { data: generalCategory } = useQuery({
    queryKey: ['general-category'],
    queryFn: categoryService.getGeneralCategory,
  })

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['manage-products', debouncedSearch],
    queryFn: () =>
      productService.getManageProducts({
        search: debouncedSearch.trim() || undefined,
        size: 100,
      }),
  })

  useEffect(() => {
    if (generalCategory && modalMode === 'create' && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: String(generalCategory.id) }))
    }
  }, [generalCategory, modalMode, formData.categoryId])

  const loadProductImages = async (productId: number) => {
    try {
      const images = await productImageService.getByProduct(productId)
      setExistingImages(images)
      return images
    } catch {
      setExistingImages([])
      return []
    }
  }

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const product = await productService.createProduct(data)
      if (pendingFiles.length > 0) {
        await uploadImages(product.id, pendingFiles)
      }
      return product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-products'] })
      toast.success(t('admin.product.created'))
      closeModal()
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || t('admin.product.error')),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const product = await productService.updateProduct(id, data)
      if (pendingFiles.length > 0) {
        await uploadImages(product.id, pendingFiles)
      }
      return product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-products'] })
      toast.success(t('admin.product.updated'))
      closeModal()
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || t('admin.product.error')),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      productService.toggleStatus(id, active),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['manage-products'] })
      toast.success(
        active ? t('admin.product.enabled') : t('admin.product.disabled')
      )
    },
    onError: () => toast.error(t('admin.product.error')),
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      productImageService.remove(productId, imageId),
    onSuccess: () => {
      if (selectedProduct) loadProductImages(selectedProduct.id)
      toast.success(t('admin.product.imageRemoved'))
    },
    onError: () => toast.error(t('admin.product.error')),
  })

  const openCreate = () => {
    setFormData({
      ...emptyForm,
      categoryId: generalCategory ? String(generalCategory.id) : '',
    })
    setSelectedProduct(null)
    setPendingFiles([])
    setExistingImages([])
    setModalMode('create')
  }

  const openEdit = async (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      barcode: product.barcode,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      categoryId: product.categoryId?.toString() || String(generalCategory?.id || ''),
      ivaRate: product.ivaRate,
      lowStockThreshold: product.lowStockThreshold?.toString() || '',
      madeToOrder: Boolean(product.madeToOrder),
    })
    setPendingFiles([])
    await loadProductImages(product.id)
    setModalMode('edit')
  }

  const openView = async (product: Product) => {
    setSelectedProduct(product)
    await loadProductImages(product.id)
    setModalMode('view')
  }

  const handleDisable = (product: Product) => {
    const message = product.active
      ? t('admin.product.confirmDisable', { name: product.name })
      : t('admin.product.confirmEnable', { name: product.name })
    if (window.confirm(message)) {
      toggleMutation.mutate({ id: product.id, active: !product.active })
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedProduct(null)
    setPendingFiles([])
    setExistingImages([])
    setFormData(emptyForm)
  }

  const buildPayload = () => ({
    name: formData.name,
    description: formData.description || null,
    barcode: formData.barcode || null,
    price: Number(formData.price),
    stockQuantity: Number(formData.stockQuantity),
    categoryId: Number(formData.categoryId),
    ivaRate: formData.ivaRate,
    lowStockThreshold: formData.lowStockThreshold ? Number(formData.lowStockThreshold) : null,
    madeToOrder: formData.madeToOrder,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = buildPayload()
    if (modalMode === 'edit' && selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: payload })
    } else if (modalMode === 'create') {
      createMutation.mutate(payload)
    }
  }

  const productList = products?.content || []
  const editableCategories = categories?.filter((c) => c.active !== false) || []

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.product.title')}</h1>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('admin.product.new')}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder={t('admin.product.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">{t('common.loading')}</div>
        ) : isError ? (
          <div className="text-center py-12 text-red-600">{t('admin.product.error')}</div>
        ) : productList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {debouncedSearch ? t('admin.product.noResults') : t('admin.product.noProducts')}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product.name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product.category')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product.price')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product.stock')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.product.status')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.product.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productList.map((product) => (
                  <tr key={product.id} className={!product.active ? 'bg-gray-50 opacity-75' : ''}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.barcode}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.categoryName || 'GENERAL'}</td>
                    <td className="px-4 py-3 text-sm">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{product.stockQuantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.active ? t('admin.product.active') : t('admin.product.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionsMenu
                        items={[
                          { label: t('admin.actions.view'), onClick: () => openView(product) },
                          { label: t('admin.actions.edit'), onClick: () => openEdit(product) },
                          {
                            label: product.active ? t('admin.actions.disable') : t('admin.actions.enable'),
                            onClick: () => handleDisable(product),
                            danger: product.active,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' && t('admin.product.new')}
                {modalMode === 'edit' && t('admin.product.edit')}
                {modalMode === 'view' && t('admin.actions.view')}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {modalMode === 'view' && selectedProduct && (
              <div className="p-6 space-y-4">
                <ProductImageSlider
                  images={existingImages}
                  alt={selectedProduct.name}
                  className="aspect-video w-full rounded-lg"
                  showControlsAlways
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">{t('admin.product.name')}:</span> <strong>{selectedProduct.name}</strong></div>
                  <div><span className="text-gray-500">{t('admin.product.price')}:</span> <strong>${selectedProduct.price.toFixed(2)}</strong></div>
                  <div><span className="text-gray-500">{t('admin.product.stock')}:</span> <strong>{selectedProduct.stockQuantity}</strong></div>
                  <div><span className="text-gray-500">{t('admin.product.category')}:</span> <strong>{selectedProduct.categoryName || 'GENERAL'}</strong></div>
                  <div><span className="text-gray-500">{t('admin.product.barcode')}:</span> <strong>{selectedProduct.barcode}</strong></div>
                  <div>
                    <span className="text-gray-500">{t('admin.product.status')}:</span>{' '}
                    <strong>{selectedProduct.active ? t('admin.product.active') : t('admin.product.inactive')}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('admin.product.madeToOrder')}:</span>{' '}
                    <strong>{selectedProduct.madeToOrder ? t('common.yes') : t('common.no')}</strong>
                  </div>
                </div>
                {selectedProduct.description && (
                  <div className="text-sm">
                    <span className="text-gray-500">{t('admin.product.description')}:</span>
                    <p className="mt-1 text-gray-800">{selectedProduct.description}</p>
                  </div>
                )}
                <button onClick={closeModal} className="w-full py-2 border rounded-lg hover:bg-gray-50">
                  {t('common.cancel')}
                </button>
              </div>
            )}

            {(modalMode === 'create' || modalMode === 'edit') && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.name')} *</label>
                  <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.price')} *</label>
                  <input required type="number" step="0.01" min="0" value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.stock')} *</label>
                  <input required type="number" min="0" value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.category')} *</label>
                  <select required value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    {editableCategories.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.description')}</label>
                  <textarea value={formData.description} rows={2}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.barcode')}</label>
                  <input value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.madeToOrder}
                    onChange={(e) => setFormData({ ...formData, madeToOrder: e.target.checked })}
                  />
                  {t('admin.product.madeToOrder')}
                </label>

                {modalMode === 'edit' && existingImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('admin.product.currentImages')}</label>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={toImageSrc(img.imageData)}
                            alt=""
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedProduct && window.confirm(t('admin.product.confirmRemoveImage'))) {
                                deleteImageMutation.mutate({ productId: selectedProduct.id, imageId: img.id })
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {modalMode === 'edit' ? t('admin.product.addImages') : t('admin.product.image')}
                  </label>
                  <ImageUploadField files={pendingFiles} onChange={setPendingFiles} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
                    {t('common.cancel')}
                  </button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {createMutation.isPending || updateMutation.isPending ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ProductManagementPage
