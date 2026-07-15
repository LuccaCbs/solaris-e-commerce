import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartService } from '../api/cartService'
import { FeaturedProduct } from '../api/featuredProductService'
import { getStoredUser } from '../utils/auth'
import toast from 'react-hot-toast'

export const useAddToCart = (item: FeaturedProduct) => {
  const [isAdding, setIsAdding] = useState(false)
  const queryClient = useQueryClient()
  const user = getStoredUser()

  const mutation = useMutation({
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
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al agregar al carrito'
      toast.error(message)
      setIsAdding(false)
    },
  })

  const addToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (item.stockQuantity <= 0) {
      toast.error('Producto sin stock')
      return
    }
    setIsAdding(true)
    mutation.mutate()
  }

  return { addToCart, isAdding }
}
