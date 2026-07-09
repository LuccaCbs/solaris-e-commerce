import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, FolderTree } from 'lucide-react'
import toast from 'react-hot-toast'
import ActionsMenu from '../../components/ActionsMenu'
import { categoryService } from '../../api/categoryService'
import { Category } from '../../types/category'

const CategoryManagementPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null)
  const [selected, setSelected] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('admin.category.created'))
      closeModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.category.error')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description: string } }) =>
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
    setFormData({ name: '', description: '' })
  }

  const openCreate = () => {
    setFormData({ name: '', description: '' })
    setSelected(null)
    setModalMode('create')
  }

  const openEdit = (category: Category) => {
    setSelected(category)
    setFormData({ name: category.name, description: category.description || '' })
    setModalMode('edit')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'edit' && selected) {
      updateMutation.mutate({ id: selected.id, data: formData })
    } else if (modalMode === 'create') {
      createMutation.mutate(formData)
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category.description')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.category.status')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.category.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className={category.active === false ? 'bg-gray-50 opacity-75' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {category.name}
                      {category.systemCategory && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{t('admin.category.system')}</span>
                      )}
                    </td>
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
