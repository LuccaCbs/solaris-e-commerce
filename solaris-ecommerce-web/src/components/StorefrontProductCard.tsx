import { FeaturedProduct, CardType } from '../api/featuredProductService'
import BasicProductCard from './productCards/BasicProductCard'
import CompactProductCard from './productCards/CompactProductCard'
import MenuProductCard from './productCards/MenuProductCard'

type StorefrontProductCardProps = {
  item: FeaturedProduct
  onSelect?: (item: FeaturedProduct) => void
  largeMenu?: boolean
}

const StorefrontProductCard = ({ item, onSelect, largeMenu = false }: StorefrontProductCardProps) => {
  const cardType: CardType = item.cardType || 'BASIC'

  switch (cardType) {
    case 'COMPACT':
      return <CompactProductCard item={item} onSelect={onSelect} />
    case 'MENU':
      return <MenuProductCard item={item} onSelect={onSelect} large={largeMenu} />
    case 'BASIC':
    default:
      return <BasicProductCard item={item} onSelect={onSelect} />
  }
}

export default StorefrontProductCard
