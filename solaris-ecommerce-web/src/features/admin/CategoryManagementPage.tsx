import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, FolderTree, Image as ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ActionsMenu from '../../components/ActionsMenu'
import { categoryService } from '../../api/categoryService'
import { fileToBase64, toImageSrc } from '../../api/productImageService'
import { Category } from '../../types/category'

type CategoryFormData = {
  name: string
  description: string
  parentId: string
  imageData: string
}

const emptyForm: CategoryFormData = { name: '', description: '', parentId: '', imageData: '' }

const CategoryManagementPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selected, setSelected] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const topLevelCategories = (categories || []).filter((category) => !category.parentId)

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

  const openCreate = () => {
    setFormData(emptyForm)
    setSelected(null)
    setModalMode('create')
  }

  const openEdit = (category: Category) => {
    setSelected(category)
    setFormData({
      name: category.name,
      description: category.description || '',
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
    const payload = {
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId ? Number(formData.parentId) : null,
      imageData: formData.imageData || null,
    }
    if (modalMode === 'edit' && selected) {
      updateMutation.mutate({ id: selected.id, data: payload })
    } else if (modalMode === 'create') {
      createMutation.mutate(payload)
    }
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.category.title')}</h1>
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('admin.category.new')}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">{t('common.loading')}</div>
        ) : !categories?.length ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.category.noCategories')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category.name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category.parent')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category.description')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category.status')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.category.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className={category.active === false ? 'bg-gray-50 opacity-75' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {category.imageData ? (
                          <img src={toImageSrc(category.imageData)} alt={category.name} className="w-8 h-8 rounded object-cover border" />
                        ) : (
                          <span className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-4 h-4" />
                          </span>
                        )}
                        {category.parentId ? <span className="text-gray-400">↳</span> : null}
                        {category.name}
                      </div>
                      {category.systemCategory && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{t('admin.category.system')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.parentName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${category.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {category.active !== false ? t('admin.category.active') : t('admin.category.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionsMenu
                        items={[
                          {
                            label: t('admin.actions.view'),
                            onClick: () => { setSelected(category); setModalMode('view') },
                          },
                          {
                            label: t('admin.actions.edit'),
                            onClick: () => openEdit(category),
                            hidden: category.systemCategory,
                          },
                          {
                            label: category.active !== false ? t('admin.actions.disable') : t('admin.actions.enable'),
                            onClick: () => toggleMutation.mutate({ id: category.id, active: category.active === false }),
                            hidden: category.systemCategory,
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

      {modalMode && modalMode !== 'view' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? t('admin.category.new') : t('admin.category.edit')}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.category.name')} *</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.category.description')}</label>
                <textarea value={formData.description} rows={3}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.category.parent')}</label>
                <select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">{t('admin.category.noParent')}</option>
                  {topLevelCategories
                    .filter((category) => category.id !== selected?.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.category.image')}</label>
                <div className="flex items-center gap-3">
                  {formData.imageData ? (
                    <div className="relative">
                      <img src={toImageSrc(formData.imageData)} alt="preview" className="w-16 h-16 rounded-lg object-cover border" />
                      <button type="button" onClick={() => setFormData({ ...formData, imageData: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </span>
                  )}
                  <label className="px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                    {t('admin.category.uploadImage')}
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

      {modalMode === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-3">
            <h2 className="text-xl font-semibold">{selected.name}</h2>
            <p className="text-gray-600">{selected.description || '-'}</p>
            <button onClick={closeModal} className="w-full py-2 border rounded-lg mt-4">{t('common.cancel')}</button>
          </div>
        </div>
      )}
    </>
  )
}

export default CategoryManagementPage
