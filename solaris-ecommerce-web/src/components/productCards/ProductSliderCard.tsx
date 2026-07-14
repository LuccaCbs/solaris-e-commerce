import { FeaturedProduct } from '../../api/featuredProductService'
import ProductImageSlider from '../ProductImageSlider'

type ProductSliderCardProps = {
  item: FeaturedProduct
  onSelect?: (item: FeaturedProduct) => void
}

const ProductSliderCard = ({ item, onSelect }: ProductSliderCardProps) => {
  return (
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect(item)
        }
      }}
      className={`bg-white rounded-md shadow-sm hover:shadow-md transition h-full flex flex-col overflow-hidden border border-gray-100 ${
        onSelect ? 'cursor-pointer' : ''
      }`}
    >
      <ProductImageSlider
        images={item.images}
        alt={item.productName}
        className="aspect-square w-full"
      />
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug text-center">
          {item.productName}
        </h3>
      </div>
    </article>
  )
}

export default ProductSliderCard
