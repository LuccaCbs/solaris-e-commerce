import apiClient from './axiosClient'
import { ProductImage } from './productImageService'

export type CardType = 'BASIC' | 'COMPACT' | 'MENU'

export type DisplayMode = 'INDIVIDUAL' | 'BY_CATEGORY'

export type FeaturedProduct = {
  id: number
  productId: number
  productName: string
  productDescription?: string
  price: number
  stockQuantity: number
  categoryName?: string
  cardType: CardType
  displayOrder: number
  active: boolean
  images: ProductImage[]
}

export type FeaturedProductRequest = {
  productId: number
  cardType: CardType
  displayOrder?: number
  active?: boolean
}

export type PublicStorefront = {
  displayMode: DisplayMode
  products: FeaturedProduct[]
}

export const featuredProductService = {
  getAll: async (): Promise<FeaturedProduct[]> => {
    const response = await apiClient.get('/featured-products')
    return response.data
  },

  getPublic: async (): Promise<PublicStorefront> => {
    const response = await apiClient.get('/public/storefront')
    return response.data
  },

  create: async (data: FeaturedProductRequest): Promise<FeaturedProduct> => {
    const response = await apiClient.post('/featured-products', data)
    return response.data
  },

  update: async (id: number, data: Partial<FeaturedProductRequest>): Promise<FeaturedProduct> => {
    const response = await apiClient.put(`/featured-products/${id}`, data)
    return response.data
  },

  toggleStatus: async (id: number, active: boolean): Promise<FeaturedProduct> => {
    const response = await apiClient.patch(`/featured-products/${id}/status`, null, {
      params: { active },
    })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/featured-products/${id}`)
  },
}
