import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { cartService } from '../../api/cartService'
import { getStoredUser } from '../../utils/auth'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import LanguageSelector from '../../components/LanguageSelector'

const CartPage = () => {
  const { t } = useTranslation()
  const [cartIdentifier, setCartIdentifier] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const user = getStoredUser()

  useEffect(() => {
    const savedCartId = localStorage.getItem('cartIdentifier')
    if (savedCartId) {
      setCartIdentifier(savedCartId)
    }
  }, [])

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', cartIdentifier, user?.id],
    queryFn: () => cartService.getCart(user?.id, cartIdentifier || undefined),
    enabled: Boolean(cartIdentifier || user?.id),
  })

  useEffect(() => {
    if (cart?.cartIdentifier && cart.cartIdentifier !== cartIdentifier) {
      localStorage.setItem('cartIdentifier', cart.cartIdentifier)
      setCartIdentifier(cart.cartIdentifier)
    }
  }, [cart?.cartIdentifier, cartIdentifier])

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartService.updateCartItem(user?.id, cartIdentifier || undefined, itemId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', cartIdentifier], data)
      toast.success(t('cart.update'))
    },
    onError: () => {
      toast.error(t('cart.error'))
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) =>
      cartService.removeCartItem(user?.id, cartIdentifier || undefined, itemId),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', cartIdentifier], data)
      toast.success(t('cart.remove'))
    },
    onError: () => {
      toast.error(t('cart.error'))
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(user?.id, cartIdentifier || undefined),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', cartIdentifier], data)
      toast.success('Carrito vaciado')
    },
    onError: () => {
      toast.error('Error al vaciar el carrito')
    },
  })

  const handleQuantityChange = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity > 0) {
      updateItemMutation.mutate({ itemId, quantity: newQuantity })
    }
  }

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId)
  }

  const handleClearCart = () => {
    if (window.confirm(t('cart.remove'))) {
      clearCartMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-600 mb-6">{t('cart.emptyMessage')}</p>
          <button
            onClick={() => (window.location.href = '/catalog')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {t('cart.continueShopping')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('cart.title')}</h1>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Lista de items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {cart.totalItems} {cart.totalItems === 1 ? t('cart.quantity') : t('cart.quantity')}
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📦</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">{item.productBarcode}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cart.subtotal')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t('cart.subtotal')}</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Impuestos</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
                  <span>{t('cart.total')}</span>
                  <span className="text-xl">${cart.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                {t('cart.checkout')}
              </button>

              <button
                onClick={() => (window.location.href = '/catalog')}
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CartPage
