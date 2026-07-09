import { FeaturedProduct } from '../../api/featuredProductService'
import ProductImageSlider from '../ProductImageSlider'

type BasicProductCardProps = {
  item: FeaturedProduct
  onSelect?: (item: FeaturedProduct) => void
}

const BasicProductCard = ({ item, onSelect }: BasicProductCardProps) => {
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
      className={`bg-white rounded-md shadow-sm hover:shadow-md transition h-full flex flex-col overflow-hidden border border-gray-100 ${onSelect ? 'cursor-pointer' : ''}`}
    >
        <ProductImageSlider
          images={item.images}
          alt={item.productName}
          className="aspect-square w-full"
        />
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 leading-snug">
            {item.productName}
          </h3>
          {item.productDescription && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.productDescription}</p>
          )}
          <div className="mt-auto">
            <p className="text-xl font-normal text-gray-900">
              $ {item.price.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </p>
            {item.stockQuantity > 0 ? (
              <p className="text-xs text-green-600 mt-1">Envío gratis</p>
            ) : (
              <p className="text-xs text-red-500 mt-1">Sin stock</p>
            )}
          </div>
        </div>
      </article>
  )
}

export default BasicProductCard
