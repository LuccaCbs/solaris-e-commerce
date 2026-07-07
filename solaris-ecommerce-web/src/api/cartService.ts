import apiClient from './axiosClient'

export interface CartItem {
  id: number
  productId: number
  productName: string
  productBarcode: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  id: number
  cartIdentifier: string
  userId: number | null
  createdAt: string
  updatedAt: string
  totalAmount: number
  totalItems: number
  items: CartItem[]
}

export const cartService = {
  getCart: async (userId?: number, cartIdentifier?: string): Promise<Cart> => {
    const headers: Record<string, string> = {}
    if (userId) headers['X-User-Id'] = userId.toString()
    
    const params = cartIdentifier ? { cartIdentifier } : {}
    
    const response = await apiClient.get('/cart', { headers, params })
    return response.data
  },

  addItemToCart: async (
    userId: number | undefined,
    cartIdentifier: string | undefined,
    productId: number,
    quantity: number
  ): Promise<Cart> => {
    const headers: Record<string, string> = {}
    if (userId) headers['X-User-Id'] = userId.toString()
    
    const params = cartIdentifier ? { cartIdentifier } : {}
    
    const response = await apiClient.post('/cart/items', 
      { productId, quantity },
      { headers, params }
    )
    return response.data
  },

  updateCartItem: async (
    userId: number | undefined,
    cartIdentifier: string | undefined,
    itemId: number,
    quantity: number
  ): Promise<Cart> => {
    const headers: Record<string, string> = {}
    if (userId) headers['X-User-Id'] = userId.toString()
    
    const params = { 
      ...(cartIdentifier && { cartIdentifier }),
      quantity 
    }
    
    const response = await apiClient.put(`/cart/items/${itemId}`, null, { headers, params })
    return response.data
  },

  removeCartItem: async (
    userId: number | undefined,
    cartIdentifier: string | undefined,
    itemId: number
  ): Promise<Cart> => {
    const headers: Record<string, string> = {}
    if (userId) headers['X-User-Id'] = userId.toString()
    
    const params = cartIdentifier ? { cartIdentifier } : {}
    
    const response = await apiClient.delete(`/cart/items/${itemId}`, { headers, params })
    return response.data
  },

  clearCart: async (userId?: number, cartIdentifier?: string): Promise<Cart> => {
    const headers: Record<string, string> = {}
    if (userId) headers['X-User-Id'] = userId.toString()
    
    const params = cartIdentifier ? { cartIdentifier } : {}
    
    const response = await apiClient.delete('/cart/clear', { headers, params })
    return response.data
  },
}
