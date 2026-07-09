import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import FeaturedAdminCard from '../../components/FeaturedAdminCard'
import { featuredProductService, CardType, DisplayMode } from '../../api/featuredProductService'
import { productService } from '../../api/productService'
import { storeConfigService } from '../../api/storeConfigService'
import { Product } from '../../types/product'
import {
  CARD_SECTIONS,
  FEATURED_DISPLAY_MODE_KEY,
  UNIFORM_GRID_CLASS,
  groupByCardType,
} from '../../utils/featuredProductLayout'

const CARD_TYPES: { value: CardType; labelKey: string }[] = [
  { value: 'BASIC', labelKey: 'admin.featured.cardBasic' },
  { value: 'COMPACT', labelKey: 'admin.featured.cardCompact' },
  { value: 'MENU', labelKey: 'admin.featured.cardMenu' },
]

const DISPLAY_MODES: { value: DisplayMode; labelKey: string }[] = [
  { value: 'INDIVIDUAL', labelKey: 'admin.featured.modeIndividual' },
  { value: 'BY_CATEGORY', labelKey: 'admin.featured.modeByCategory' },
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

  const { data: displayModeConfig } = useQuery({
    queryKey: ['config', FEATURED_DISPLAY_MODE_KEY],
    queryFn: () => storeConfigService.getConfigByKey(FEATURED_DISPLAY_MODE_KEY),
  })

  const displayMode: DisplayMode =
    displayModeConfig?.configValue === 'BY_CATEGORY' ? 'BY_CATEGORY' : 'INDIVIDUAL'

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
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || t('admin.featured.error')),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-products'] })
      queryClient.invalidateQueries({ queryKey: ['public-storefront'] })
      toast.success(t('admin.featured.cardUpdated'))
    },
    onError: () => toast.error(t('admin.featured.error')),
  })

  const updateDisplayModeMutation = useMutation({
    mutationFn: (mode: DisplayMode) =>
      storeConfigService.updateConfig(FEATURED_DISPLAY_MODE_KEY, {
        configKey: FEATURED_DISPLAY_MODE_KEY,
        configValue: mode,
        category: 'storefront',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', FEATURED_DISPLAY_MODE_KEY] })
      queryClient.invalidateQueries({ queryKey: ['public-storefront'] })
      toast.success(t('admin.featured.displayModeUpdated'))
    },
    onError: () => toast.error(t('admin.featured.error')),
  })

  const availableProducts =
    products?.filter(
      (p: Product) => p.active && !featured?.some((f) => f.productId === p.id)
    ) || []

  const grouped = groupByCardType(featured || [])

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.featured.title')}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('admin.featured.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 self-start"
          >
            <Plus className="w-5 h-5" />
            {t('admin.featured.add')}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.featured.displayMode')}
          </label>
          <select
            value={displayMode}
            onChange={(e) => updateDisplayModeMutation.mutate(e.target.value as DisplayMode)}
            disabled={updateDisplayModeMutation.isPending}
            className="w-full max-w-md px-3 py-2 border rounded-lg text-sm"
          >
            {DISPLAY_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {t(mode.labelKey)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">{t('admin.featured.displayModeHint')}</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">{t('common.loading')}</div>
        ) : !featured?.length ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('admin.featured.empty')}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {CARD_SECTIONS.map((section) => {
              const items = grouped[section.type]
              if (!items.length) return null

              return (
                <section key={section.type}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t(section.titleKey)}
                  </h2>
                  <div className={UNIFORM_GRID_CLASS}>
                    {items.map((item) => (
                      <FeaturedAdminCard
                        key={item.id}
                        item={item}
                        cardTypes={CARD_TYPES}
                        onCardTypeChange={(id, type) =>
                          updateCardMutation.mutate({ id, cardType: type })
                        }
                        onToggleActive={(id, active) => toggleMutation.mutate({ id, active })}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        isUpdating={updateCardMutation.isPending}
                        t={t}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
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
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">{t('admin.featured.chooseProduct')}</option>
                  {availableProducts.map((p: Product) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('admin.featured.cardType')} *</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as CardType)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {CARD_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>
                      {t(ct.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg">
                  {t('common.cancel')}
                </button>
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
