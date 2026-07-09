import ActionsMenu from './ActionsMenu'
import StorefrontProductCard from './StorefrontProductCard'
import { FeaturedProduct, CardType } from '../api/featuredProductService'

type FeaturedAdminCardProps = {
  item: FeaturedProduct
  cardTypes: { value: CardType; labelKey: string }[]
  onCardTypeChange: (id: number, cardType: CardType) => void
  onToggleActive: (id: number, active: boolean) => void
  onDelete: (id: number) => void
  isUpdating?: boolean
  t: (key: string) => string
}

const FeaturedAdminCard = ({
  item,
  cardTypes,
  onCardTypeChange,
  onToggleActive,
  onDelete,
  isUpdating,
  t,
}: FeaturedAdminCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3 shrink-0">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{item.categoryName || 'GENERAL'}</p>
          <label className="block text-xs text-gray-500 mt-2 mb-1">{t('admin.featured.cardType')}</label>
          <select
            value={item.cardType}
            onChange={(e) => onCardTypeChange(item.id, e.target.value as CardType)}
            disabled={isUpdating}
            className="w-full text-sm border rounded px-2 py-1"
          >
            {cardTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {t(ct.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <ActionsMenu
          items={[
            {
              label: item.active ? t('admin.actions.disable') : t('admin.actions.enable'),
              onClick: () => onToggleActive(item.id, !item.active),
            },
            {
              label: t('common.delete'),
              onClick: () => onDelete(item.id),
              danger: true,
            },
          ]}
        />
      </div>

      <div className="flex-1 min-h-[180px] flex items-stretch">
        <div className="w-full">
          <StorefrontProductCard item={item} largeMenu={item.cardType === 'MENU'} />
        </div>
      </div>
    </div>
  )
}

export default FeaturedAdminCard
