import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import ActionsMenu from '../../components/ActionsMenu'
import StorefrontProductCard from '../../components/StorefrontProductCard'
import { featuredProductService, CardType } from '../../api/featuredProductService'
import { productService } from '../../api/productService'
import { Product } from '../../types/product'

const CARD_TYPES: { value: CardType; labelKey: string }[] = [
  { value: 'BASIC', labelKey: 'admin.featured.cardBasic' },
  { value: 'COMPACT', labelKey: 'admin.featured.cardCompact' },
  { value: 'MENU', labelKey: 'admin.featured.cardMenu' },
]

const FeaturedProductsPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [productId, setProductId] = useState('')
  const [cardType, setCardType] = useState<CardType>('BASIC')

  const { data: featured, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: featuredProductService.getAll,
  })

  const { data: products } = useQuery({
    queryKey: ['active-products'],
    queryFn: productService.getActiveProducts,
    enabled: showModal,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      featuredProductService.create({
        productId: Number(productId),
        cardType,
        displayOrder: (featured?.length || 0) + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-products'] })
      toast.success(t('admin.featured.created'))
      setShowModal(false)
      setProductId('')
      setCardType('BASIC')
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || t('admin.featured.error')),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      featuredProductService.toggleStatus(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['featured-products'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => featuredProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-products'] })
      toast.success(t('admin.featured.deleted'))
    },
  })

  const updateCardMutation = useMutation({
    mutationFn: ({ id, cardType }: { id: number; cardType: CardType }) =>
      featuredProductService.update(id, { cardType }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['featured-products'] }),
  })

  const availableProducts = products?.filter(
    (p: Product) => p.active && !featured?.some((f) => f.productId === p.id)
  ) || []

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.featured.title')}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.featured.subtitle')}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('admin.featured.add')}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">{t('common.loading')}</div>
        ) : !featured?.length ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.featured.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featured.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <select
                      value={item.cardType}
                      onChange={(e) => updateCardMutation.mutate({ id: item.id, cardType: e.target.value as CardType })}
                      className="mt-1 text-sm border rounded px-2 py-1"
                    >
                      {CARD_TYPES.map((ct) => (
                        <option key={ct.value} value={ct.value}>{t(ct.labelKey)}</option>
                      ))}
                    </select>
                  </div>
                  <ActionsMenu
                    items={[
                      {
                        label: item.active ? t('admin.actions.disable') : t('admin.actions.enable'),
                        onClick: () => toggleMutation.mutate({ id: item.id, active: !item.active }),
                      },
                      {
                        label: t('common.delete'),
                        onClick: () => deleteMutation.mutate(item.id),
                        danger: true,
                      },
                    ]}
                  />
                </div>
                <div className="max-w-xs">
                  <StorefrontProductCard item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">{t('admin.featured.add')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.featured.selectProduct')} *</label>
                <select value={productId} onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="">{t('admin.featured.chooseProduct')}</option>
                  {availableProducts.map((p: Product) => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.featured.cardType')} *</label>
                <select value={cardType} onChange={(e) => setCardType(e.target.value as CardType)}
                  className="w-full px-3 py-2 border rounded-lg">
                  {CARD_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{t(ct.labelKey)}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">{t('common.cancel')}</button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!productId || createMutation.isPending}
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

export default FeaturedProductsPage
