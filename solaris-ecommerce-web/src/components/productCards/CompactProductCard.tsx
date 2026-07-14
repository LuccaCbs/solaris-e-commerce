import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FeaturedProduct } from '../../api/featuredProductService'
import { cartService } from '../../api/cartService'
import ProductImageSlider from '../ProductImageSlider'
import { getStoredUser } from '../../utils/auth'
import { ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

type CompactProductCardProps = {
  item: FeaturedProduct
  onSelect?: (item: FeaturedProduct) => void
}

const CompactProductCard = ({ item, onSelect }: CompactProductCardProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const queryClient = useQueryClient()
  const user = getStoredUser()

  const addToCartMutation = useMutation({
    mutationFn: () => {
      const cartIdentifier = localStorage.getItem('cartIdentifier')
      return cartService.addItemToCart(user?.id, cartIdentifier || undefined, item.productId, 1)
    },
    onSuccess: (data) => {
      if (data.cartIdentifier) {
        localStorage.setItem('cartIdentifier', data.cartIdentifier)
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Producto agregado al carrito')
      setIsAdding(false)
    },
    onError: () => {
      toast.error('Error al agregar al carrito')
      setIsAdding(false)
    },
  })

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.stockQuantity <= 0) {
      toast.error('Producto sin stock')
      return
    }
    setIsAdding(true)
    addToCartMutation.mutate()
  }

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
            onClick={handleAddToCart}
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
