import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Tags, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { categoryService } from '../../api/categoryService'
import { featuredCategoryService } from '../../api/featuredCategoryService'
import { toImageSrc } from '../../api/productImageService'
import { Category } from '../../types/category'

const FeaturedCategoriesPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [categoryId, setCategoryId] = useState('')

  const { data: featuredCategories, isLoading } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: featuredCategoryService.getAll,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
    enabled: showModal,
  })

  const createMutation = useMutation({
    mutationFn: () => featuredCategoryService.create({
      categoryId: Number(categoryId),
      displayOrder: (featuredCategories?.length || 0) + 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] })
      toast.success(t('admin.featuredCategories.created'))
      setShowModal(false)
      setCategoryId('')
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || t('admin.featuredCategories.error')),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      featuredCategoryService.toggleStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['featured-categories'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => featuredCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] })
      toast.success(t('admin.featuredCategories.deleted'))
    },
    onError: () => toast.error(t('admin.featuredCategories.error')),
  })

  const availableCategories = categories?.filter(
    (category: Category) => category.active !== false && !category.systemCategory && !featuredCategories?.some((featured) => featured.categoryId === category.id)
  ) || []

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.featuredCategories.title')}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.featuredCategories.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 self-start"
          >
            <Plus className="w-5 h-5" />
            {t('admin.featuredCategories.add')}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">{t('common.loading')}</div>
        ) : !featuredCategories?.length ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Tags className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.featuredCategories.empty')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
            {featuredCategories.map((featured) => (
              <div key={featured.id} className="flex items-center gap-4 p-4">
                {featured.imageData ? (
                  <img src={toImageSrc(featured.imageData)} alt={featured.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Tags className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{featured.name}</h2>
                  {featured.description && <p className="text-sm text-gray-500 line-clamp-2">{featured.description}</p>}
                  <span className="text-xs text-gray-400">{t('admin.featuredCategories.order')}: {featured.displayOrder}</span>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ id: featured.id, active: !featured.active })}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${featured.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {featured.active ? t('admin.featuredCategories.active') : t('admin.featuredCategories.inactive')}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(featured.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title={t('admin.actions.delete')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.featuredCategories.add')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.featuredCategories.selectCategory')} *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">{t('admin.featuredCategories.chooseCategory')}</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!categoryId || createMutation.isPending}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FeaturedCategoriesPage
