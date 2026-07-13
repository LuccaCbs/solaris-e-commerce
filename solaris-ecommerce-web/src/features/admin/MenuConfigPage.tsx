import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, FolderTree, Edit2, X, ChevronRight, ChevronDown, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '../../api/categoryService'
import { fileToBase64, toImageSrc } from '../../api/productImageService'
import { Category } from '../../types/category'

type AssignFormData = {
  categoryId: string
  categoryType: 'MENU' | 'SUBMENU'
  parentId: string
  imageData: string | null
}

const emptyAssignForm: AssignFormData = {
  categoryId: '',
  categoryType: 'MENU',
  parentId: '',
  imageData: '',
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  MENU: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Menú' },
  SUBMENU: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sub-menú' },
}

const invalidateMenuQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['categories'] })
  queryClient.invalidateQueries({ queryKey: ['category-tree'] })
}

const MenuConfigPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalMode, setModalMode] = useState<'assign' | 'edit' | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<AssignFormData>(emptyAssignForm)
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set())

  const { data: menuTree = [], isLoading } = useQuery({
    queryKey: ['category-tree'],
    queryFn: categoryService.getCategoryTree,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  useEffect(() => {
    if (menuTree.length > 0 && expandedMenus.size === 0) {
      setExpandedMenus(new Set(menuTree.map((m) => m.id)))
    }
  }, [menuTree, expandedMenus.size])

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

  const closeModal = () => {
    setModalMode(null)
    setEditingCategory(null)
    setFormData(emptyAssignForm)
  }

  const openAssign = () => {
    setEditingCategory(null)
    setFormData(emptyAssignForm)
    setModalMode('assign')
  }

  const openEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      categoryId: String(category.id),
      categoryType: category.categoryType === 'MENU' ? 'MENU' : 'SUBMENU',
      parentId: category.parentId ? String(category.parentId) : '',
      imageData: category.imageData || '',
    })
    setModalMode('edit')
  }

  const handleImageSelect = async (file: File | null) => {
    if (!file) return
    const base64 = await fileToBase64(file)
    setFormData((prev) => ({ ...prev, imageData: base64 }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const categoryId = modalMode === 'edit' ? editingCategory!.id : Number(formData.categoryId)
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const payload: Record<string, unknown> = {
      name: category.name,
      description: category.description,
      categoryType: formData.categoryType,
      parentId: formData.categoryType === 'SUBMENU' ? Number(formData.parentId) : null,
      imageData: formData.imageData || category.imageData || null,
    }
    updateMutation.mutate({ id: categoryId, data: payload })
  }

  const removeFromMenu = (category: Category) => {
    updateMutation.mutate({
      id: category.id,
      data: {
        name: category.name,
        description: category.description,
        categoryType: 'ITEM',
        parentId: null,
        imageData: category.imageData,
      },
    })
  }

  const toggleMenuExpansion = (menuId: number) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) newSet.delete(menuId)
      else newSet.add(menuId)
      return newSet
    })
  }

  const menuCategoryIds = new Set<number>()
  menuTree.forEach((menu) => {
    menuCategoryIds.add(menu.id)
    menu.subcategories?.forEach((sub) => menuCategoryIds.add(sub.id))
  })

  const assignableCategories = categories.filter(
    (cat) => !cat.systemCategory && cat.active !== false && !menuCategoryIds.has(cat.id)
  )

  const menuOptions = menuTree

  const renderSubmenu = (sub: Category) => (
    <div key={sub.id} className="ml-8 border-l-2 border-slate-200 pl-4 py-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{sub.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES.SUBMENU.bg} ${TYPE_STYLES.SUBMENU.text}`}>
              {TYPE_STYLES.SUBMENU.label}
            </span>
          </div>
          {sub.products && sub.products.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {sub.products.map((product) => (
                <span
                  key={product.id}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600"
                >
                  <Package className="w-3 h-3" />
                  {product.name}
                </span>
              ))}
            </div>
          )}
          {(!sub.products || sub.products.length === 0) && (
            <p className="text-xs text-slate-400 mt-1">Sin productos activos en esta categoría</p>
          )}
        </div>
        {sub.imageData && (
          <img src={toImageSrc(sub.imageData)} alt={sub.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
        )}
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(sub)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-600" title={t('admin.actions.edit')}>
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => removeFromMenu(sub)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Quitar del menú">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderMenu = (menu: Category) => {
    const isExpanded = expandedMenus.has(menu.id)
    const submenus = menu.subcategories || []
    const hasChildren = submenus.length > 0

    return (
      <div key={menu.id} className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 py-3 px-4 bg-slate-50">
          {hasChildren ? (
            <button onClick={() => toggleMenuExpansion(menu.id)} className="p-1 rounded-md hover:bg-slate-200 text-slate-600">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-6" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{menu.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES.MENU.bg} ${TYPE_STYLES.MENU.text}`}>
                {TYPE_STYLES.MENU.label}
              </span>
            </div>
          </div>
          {menu.imageData && (
            <img src={toImageSrc(menu.imageData)} alt={menu.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
          )}
          <div className="flex items-center gap-1">
            <button onClick={() => openEdit(menu)} className="p-2 rounded-lg hover:bg-slate-200 text-slate-600" title={t('admin.actions.edit')}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => removeFromMenu(menu)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Quitar del menú">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="p-2 space-y-1 bg-white">
            {submenus.map((sub) => renderSubmenu(sub))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Menús</h1>
          <p className="text-sm text-slate-500 mt-1">Menú → Sub-menú → Productos de la categoría</p>
        </div>
        <button
          onClick={openAssign}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Asignar categoría al menú
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : !menuTree.length ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FolderTree className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No hay menús configurados. Asigna una categoría existente como menú principal.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-900">Estructura de Menús</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Los ítems del menú son los productos activos de cada sub-menú. Gestiona categorías y productos desde sus respectivas secciones.
            </p>
          </div>
          <div className="p-4 space-y-3">
            {menuTree.map((menu) => renderMenu(menu))}
          </div>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {modalMode === 'assign' ? 'Asignar categoría al menú' : 'Editar en menú'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalMode === 'assign' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {assignableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {!assignableCategories.length && (
                    <p className="text-xs text-amber-600 mt-1">No hay categorías disponibles. Crea una en Gestión de Categorías.</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol en el menú *</label>
                <select
                  value={formData.categoryType}
                  onChange={(e) => setFormData({ ...formData, categoryType: e.target.value as 'MENU' | 'SUBMENU', parentId: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MENU">Menú principal (navbar)</option>
                  <option value="SUBMENU">Sub-menú</option>
                </select>
              </div>

              {formData.categoryType === 'SUBMENU' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Menú padre *</label>
                  <select
                    required
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar menú</option>
                    {menuOptions.map((menu) => (
                      <option key={menu.id} value={menu.id}>{menu.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen del menú</label>
                <div className="flex items-center gap-3">
                  {formData.imageData ? (
                    <div className="relative">
                      <img src={toImageSrc(formData.imageData)} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageData: null })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <FolderTree className="w-6 h-6" />
                    </span>
                  )}
                  <label className="px-3 py-2 border border-slate-300 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
                    Subir imagen
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
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
