import { FeaturedProduct } from '../../api/featuredProductService'
import ProductImageSlider from '../ProductImageSlider'
import { useAddToCart } from '../../hooks/useAddToCart'
import { ShoppingCart } from 'lucide-react'

type CompactProductCardProps = {
  item: FeaturedProduct
  onSelect?: (item: FeaturedProduct) => void
}

const CompactProductCard = ({ item, onSelect }: CompactProductCardProps) => {
  const { addToCart, isAdding } = useAddToCart(item)

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
      className={`bg-white rounded-md shadow-sm hover:shadow-md transition h-full flex gap-3 p-3 border border-gray-100 ${onSelect ? 'cursor-pointer' : ''}`}
    >
        <ProductImageSlider
          images={item.images}
          alt={item.productName}
          className="w-24 h-24 flex-shrink-0 rounded"
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</h3>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            $ {item.price.toLocaleString('es-AR')}
          </p>
          <button
            onClick={addToCart}
            disabled={isAdding || item.stockQuantity <= 0}
            className="mt-auto bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
          >
            <ShoppingCart className="w-3 h-3" />
            {isAdding ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </article>
  )
}

export default CompactProductCard
