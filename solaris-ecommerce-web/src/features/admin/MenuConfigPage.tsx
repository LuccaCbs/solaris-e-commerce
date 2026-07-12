import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, FolderTree, Edit2, Trash2, ChevronRight, ChevronDown, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '../../api/categoryService'
import { productService } from '../../api/productService'
import { fileToBase64, toImageSrc } from '../../api/productImageService'
import { Category } from '../../types/category'

type MenuFormData = {
  name: string
  description: string
  parentId: string
  imageData: string | null
  categoryType: 'MENU' | 'SUBMENU' | 'ITEM'
  productId: string
}

const emptyForm: MenuFormData = {
  name: '',
  description: '',
  parentId: '',
  imageData: '',
  categoryType: 'ITEM',
  productId: '',
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  MENU: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Menú' },
  SUBMENU: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sub-menú' },
  ITEM: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ítem' },
}

const invalidateMenuQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['categories'] })
  queryClient.invalidateQueries({ queryKey: ['category-tree'] })
}

const MenuConfigPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<MenuFormData>(emptyForm)
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set())

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAllProducts,
  })

  const menus = (categories || []).filter(
    (cat) => cat.categoryType === 'MENU' && !cat.systemCategory
  )

  useEffect(() => {
    if (menus.length > 0 && expandedMenus.size === 0) {
      setExpandedMenus(new Set(menus.map((m) => m.id)))
    }
  }, [menus, expandedMenus.size])

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => categoryService.createCategory(data),
    onSuccess: () => {
      invalidateMenuQueries(queryClient)
      toast.success(t('admin.category.created'))
      closeModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.category.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      invalidateMenuQueries(queryClient)
      toast.success(t('admin.category.updated'))
      closeModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.category.error')),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      categoryService.toggleStatus(id, active),
    onSuccess: () => {
      invalidateMenuQueries(queryClient)
      toast.success(t('admin.category.statusUpdated'))
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.category.error')),
  })

  const closeModal = () => {
    setModalMode(null)
    setEditingCategory(null)
    setFormData(emptyForm)
  }

  const openCreate = (parent?: Category, defaultType?: 'MENU' | 'SUBMENU' | 'ITEM') => {
    setEditingCategory(null)
    setFormData({
      ...emptyForm,
      parentId: parent ? String(parent.id) : '',
      categoryType: defaultType || (parent ? (parent.categoryType === 'MENU' ? 'SUBMENU' : 'ITEM') : 'MENU'),
    })
    setModalMode('create')
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId ? String(category.parentId) : '',
      imageData: category.imageData || '',
      categoryType: category.categoryType || 'ITEM',
      productId: category.productId ? String(category.productId) : '',
    })
    setModalMode('edit')
  }

  const handleImageSelect = async (file: File | null) => {
    if (!file) return
    const base64 = await fileToBase64(file)
    setFormData((prev) => ({ ...prev, imageData: base64 }))
  }

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === Number(productId))
    setFormData((prev) => ({
      ...prev,
      productId,
      name: product ? product.name : prev.name,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, unknown> = {
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId ? Number(formData.parentId) : null,
      imageData: formData.imageData || null,
      categoryType: formData.categoryType,
      productId: formData.productId ? Number(formData.productId) : null,
    }
    if (modalMode === 'edit' && editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload })
    } else if (modalMode === 'create') {
      createMutation.mutate(payload)
    }
  }

  const toggleMenuExpansion = (menuId: number) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  const getSubcategories = (parentId: number) =>
    (categories || []).filter((cat) => cat.parentId === parentId)

  const renderMenuItem = (category: Category, level = 0) => {
    const subcategories = getSubcategories(category.id)
    const isExpanded = expandedMenus.has(category.id)
    const hasChildren = subcategories.length > 0
    const typeStyle = TYPE_STYLES[category.categoryType || 'ITEM']

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors hover:bg-slate-50 ${
            level > 0 ? 'ml-6 border-l-2 border-slate-200 pl-4' : ''
          }`}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleMenuExpansion(category.id)}
              className="p-1 rounded-md hover:bg-slate-200 text-slate-600"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-6" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">{category.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                {typeStyle.label}
              </span>
              {category.active === false && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                  Inactivo
                </span>
              )}
              {category.productName && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {category.productName}
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-slate-500 mt-0.5 truncate">{category.description}</p>
            )}
          </div>

          {category.imageData && (
            <img
              src={toImageSrc(category.imageData)}
              alt={category.name}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
            />
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(category)}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
              title={t('admin.actions.edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleMutation.mutate({ id: category.id, active: category.active === false })}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500"
              title={category.active !== false ? t('admin.actions.disable') : t('admin.actions.enable')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {category.categoryType !== 'ITEM' && (
              <button
                onClick={() =>
                  openCreate(category, category.categoryType === 'MENU' ? 'SUBMENU' : 'ITEM')
                }
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                title="Agregar hijo"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {subcategories.map((sub) => renderMenuItem(sub, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const parentOptions = categories
    ?.filter((cat) => !cat.systemCategory && cat.id !== editingCategory?.id)
    .filter((cat) =>
      formData.categoryType === 'SUBMENU'
        ? cat.categoryType === 'MENU' && !cat.systemCategory
        : cat.categoryType === 'SUBMENU'
    )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Menús</h1>
          <p className="text-sm text-slate-500 mt-1">Menú → Sub-menú → Ítem</p>
        </div>
        <button
          onClick={() => openCreate(undefined, 'MENU')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nuevo Menú Principal
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : !menus.length ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FolderTree className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No hay menús configurados. Crea tu primer menú principal.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Estructura de Menús</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Los sub-menús son categorías. Los ítems pueden ser productos o categorías hijas.
            </p>
          </div>
          <div className="p-4 space-y-1">
            {menus.map((menu) => renderMenuItem(menu))}
          </div>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {modalMode === 'create' ? 'Crear' : 'Editar'}{' '}
                {TYPE_STYLES[formData.categoryType]?.label || formData.categoryType}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formData.categoryType === 'ITEM' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Producto (opcional)</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin producto asociado</option>
                    {products
                      .filter((p) => p.active !== false)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Si seleccionas un producto, se usará su nombre en el menú.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  rows={3}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {formData.categoryType !== 'MENU' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Padre</label>
                  <select
                    required
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar padre</option>
                    {parentOptions?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(formData.categoryType === 'MENU' || formData.categoryType === 'SUBMENU') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Imagen</label>
                  <div className="flex items-center gap-3">
                    {formData.imageData ? (
                      <div className="relative">
                        <img
                          src={toImageSrc(formData.imageData)}
                          alt="preview"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageData: null })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <FolderTree className="w-6 h-6" />
                      </span>
                    )}
                    <label className="px-3 py-2 border border-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
                      Subir imagen
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuConfigPage
