import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, FolderTree, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '../../api/categoryService'
import { fileToBase64, toImageSrc } from '../../api/productImageService'
import { Category } from '../../types/category'

type MenuFormData = {
  name: string
  description: string
  parentId: string
  imageData: string | null
  categoryType: 'MENU' | 'SUBMENU' | 'ITEM'
}

const emptyForm: MenuFormData = { name: '', description: '', parentId: '', imageData: '', categoryType: 'ITEM' }

const MenuConfigPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Category | null>(null)
  const [formData, setFormData] = useState<MenuFormData>(emptyForm)
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set())

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const menus = (categories || []).filter(cat => cat.categoryType === 'MENU')

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('admin.category.created'))
      closeModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.category.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('admin.category.updated'))
      closeModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.category.error')),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      categoryService.toggleStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('admin.category.statusUpdated'))
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.category.error')),
  })

  const closeModal = () => {
    setModalMode(null)
    setSelected(null)
    setFormData(emptyForm)
  }

  const openCreate = (parentCategory?: Category, defaultType?: 'MENU' | 'SUBMENU' | 'ITEM') => {
    setFormData({
      ...emptyForm,
      parentId: parentCategory ? String(parentCategory.id) : '',
      categoryType: defaultType || (parentCategory ? 'SUBMENU' : 'MENU'),
    })
    setSelected(parentCategory || null)
    setModalMode('create')
  }

  const openEdit = (category: Category) => {
    setSelected(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId ? String(category.parentId) : '',
      imageData: category.imageData || '',
      categoryType: category.categoryType || 'ITEM',
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
    const payload = {
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId ? Number(formData.parentId) : null,
      imageData: formData.imageData || null,
      categoryType: formData.categoryType,
    }
    if (modalMode === 'edit' && selected) {
      updateMutation.mutate({ id: selected.id, data: payload })
    } else if (modalMode === 'create') {
      createMutation.mutate(payload)
    }
  }

  const toggleMenuExpansion = (menuId: number) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  const getSubcategories = (parentId: number) => {
    return (categories || []).filter(cat => cat.parentId === parentId)
  }

  const renderMenuItem = (category: Category, level: number = 0) => {
    const subcategories = getSubcategories(category.id)
    const isExpanded = expandedMenus.has(category.id)
    const hasChildren = subcategories.length > 0

    return (
      <div key={category.id} className="border-l-2" style={{ borderColor: 'var(--color-secondary)', opacity: 0.3 }}>
        <div className="flex items-center gap-2 py-2 px-4 hover:bg-gray-50">
          {hasChildren && (
            <button
              onClick={() => toggleMenuExpansion(category.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <span className="flex-1 font-medium">{category.name}</span>
          <span className="text-xs px-2 py-1 rounded bg-gray-200">{category.categoryType}</span>
          {category.imageData && (
            <img src={toImageSrc(category.imageData)} alt={category.name} className="w-8 h-8 rounded object-cover" />
          )}
          <button
            onClick={() => openEdit(category)}
            className="p-1 hover:bg-gray-200 rounded"
            title={t('admin.actions.edit')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleMutation.mutate({ id: category.id, active: category.active === false })}
            className="p-1 hover:bg-gray-200 rounded"
            title={category.active !== false ? t('admin.actions.disable') : t('admin.actions.enable')}
          >
            {category.active !== false ? <Trash2 className="w-4 h-4 text-red-500" /> : <Trash2 className="w-4 h-4 text-green-500" />}
          </button>
          <button
            onClick={() => openCreate(category, category.categoryType === 'MENU' ? 'SUBMENU' : 'ITEM')}
            className="p-1 hover:bg-gray-200 rounded"
            title="Add child"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {subcategories.map(sub => renderMenuItem(sub, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Menús</h1>
        <button onClick={() => openCreate(undefined, 'MENU')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Menú Principal
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : !menus.length ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay menús configurados. Crea tu primer menú principal.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold">Estructura de Menús</h2>
            <p className="text-sm text-gray-600">MENU (Navbar) → SUBMENU → ITEM</p>
          </div>
          <div className="divide-y divide-gray-200">
            {menus.map(menu => renderMenuItem(menu))}
          </div>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Crear' : 'Editar'} {formData.categoryType}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea value={formData.description} rows={3}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              {formData.categoryType !== 'MENU' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Padre</label>
                  <select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Sin padre</option>
                    {categories
                      ?.filter(cat => cat.id !== selected?.id)
                      .filter(cat => formData.categoryType === 'SUBMENU' ? cat.categoryType === 'MENU' : cat.categoryType === 'SUBMENU')
                      .map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Imagen</label>
                <div className="flex items-center gap-3">
                  {formData.imageData ? (
                    <div className="relative">
                      <img src={toImageSrc(formData.imageData)} alt="preview" className="w-16 h-16 rounded-lg object-cover border" />
                      <button type="button" onClick={() => setFormData({ ...formData, imageData: null })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      <FolderTree className="w-6 h-6" />
                    </span>
                  )}
                  <label className="px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                    Subir imagen
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleImageSelect(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2 border rounded-lg">{t('common.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{t('common.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuConfigPage
