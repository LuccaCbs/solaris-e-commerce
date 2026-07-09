import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import ActionsMenu from '../../components/ActionsMenu'
import { productService } from '../../api/productService'
import { categoryService } from '../../api/categoryService'
import { productImageService, fileToBase64, toImageSrc } from '../../api/productImageService'
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
}

const ProductManagementPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const { data: generalCategory } = useQuery({
    queryKey: ['general-category'],
    queryFn: categoryService.getGeneralCategory,
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['manage-products', searchTerm],
    queryFn: () => productService.getManageProducts({ search: searchTerm || undefined, size: 100 }),
  })

  useEffect(() => {
    if (generalCategory && modalMode === 'create' && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: String(generalCategory.id) }))
    }
  }, [generalCategory, modalMode, formData.categoryId])

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const product = await productService.createProduct(data)
      if (imageFile) {
        const base64 = await fileToBase64(imageFile)
        await productImageService.upload(product.id, base64)
      }
      return product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-products'] })
      toast.success(t('admin.product.created'))
      closeModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.product.error')),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const product = await productService.updateProduct(id, data)
      if (imageFile) {
        const base64 = await fileToBase64(imageFile)
        await productImageService.upload(product.id, base64)
      }
      return product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-products'] })
      toast.success(t('admin.product.updated'))
      closeModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.product.error')),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      productService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-products'] })
      toast.success(t('admin.product.statusUpdated'))
    },
    onError: () => toast.error(t('admin.product.error')),
  })

  const openCreate = () => {
    setFormData({
      ...emptyForm,
      categoryId: generalCategory ? String(generalCategory.id) : '',
    })
    setSelectedProduct(null)
    setImageFile(null)
    setPreviewImages([])
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
      categoryId: product.categoryId?.toString() || '',
      ivaRate: product.ivaRate,
      lowStockThreshold: product.lowStockThreshold?.toString() || '',
    })
    setImageFile(null)
    try {
      const images = await productImageService.getByProduct(product.id)
      setPreviewImages(images.map((img) => toImageSrc(img.imageData)))
    } catch {
      setPreviewImages([])
    }
    setModalMode('edit')
  }

  const openView = async (product: Product) => {
    setSelectedProduct(product)
    try {
      const images = await productImageService.getByProduct(product.id)
      setPreviewImages(images.map((img) => toImageSrc(img.imageData)))
    } catch {
      setPreviewImages([])
    }
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedProduct(null)
    setImageFile(null)
    setPreviewImages([])
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
        ) : productList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.product.noProducts')}</p>
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
                            onClick: () => toggleMutation.mutate({ id: product.id, active: !product.active }),
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
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' && t('admin.product.new')}
                {modalMode === 'edit' && t('admin.product.edit')}
                {modalMode === 'view' && t('admin.actions.view')}
              </h2>
            </div>

            {modalMode === 'view' && selectedProduct ? (
              <div className="p-6 space-y-3 text-sm">
                <p><strong>{t('admin.product.name')}:</strong> {selectedProduct.name}</p>
                <p><strong>{t('admin.product.description')}:</strong> {selectedProduct.description || '-'}</p>
                <p><strong>{t('admin.product.price')}:</strong> ${selectedProduct.price.toFixed(2)}</p>
                <p><strong>{t('admin.product.stock')}:</strong> {selectedProduct.stockQuantity}</p>
                <p><strong>{t('admin.product.category')}:</strong> {selectedProduct.categoryName}</p>
                {previewImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {previewImages.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded border" />
                    ))}
                  </div>
                )}
                <button onClick={closeModal} className="mt-4 w-full py-2 border rounded-lg">{t('common.cancel')}</button>
              </div>
            ) : (
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
                <div>
                  <label className="block text-sm font-medium mb-1">{t('admin.product.image')}</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-sm" />
                  {previewImages.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {previewImages.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-16 h-16 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-2 border rounded-lg">{t('common.cancel')}</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {t('common.save')}
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
