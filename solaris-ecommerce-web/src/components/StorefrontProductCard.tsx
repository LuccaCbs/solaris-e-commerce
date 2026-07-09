import { FeaturedProduct, CardType } from '../api/featuredProductService'
import BasicProductCard from './productCards/BasicProductCard'
import CompactProductCard from './productCards/CompactProductCard'
import MenuProductCard from './productCards/MenuProductCard'

type StorefrontProductCardProps = {
  item: FeaturedProduct
}

const StorefrontProductCard = ({ item }: StorefrontProductCardProps) => {
  const cardType: CardType = item.cardType || 'BASIC'

  switch (cardType) {
    case 'COMPACT':
      return <CompactProductCard item={item} />
    case 'MENU':
      return <MenuProductCard item={item} />
    case 'BASIC':
    default:
      return <BasicProductCard item={item} />
  }
}

export default StorefrontProductCard
