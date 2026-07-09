import apiClient from './axiosClient'
import { Product, Page } from '../types/product'

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products')
    return response.data
  },

  getActiveProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products/active')
    return response.data
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await apiClient.get(`/products/category/${categoryId}`)
    return response.data
  },

  createProduct: async (data: any): Promise<Product> => {
    const response = await apiClient.post('/products', data)
    return response.data
  },

  updateProduct: async (id: number, data: any): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data)
    return response.data
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  toggleStatus: async (id: number, active: boolean): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}/status`, null, { params: { active } })
    return response.data
  },

  getManageProducts: async (filters: {
    search?: string
    categoryId?: number
    page?: number
    size?: number
  }): Promise<Page<Product>> => {
    const response = await apiClient.get('/products/manage', { params: filters })
    return response.data
  },

  searchProducts: async (search: string, page = 0, size = 10) => {
    const response = await apiClient.get('/products/search', {
      params: { search, page, size }
    })
    return response.data
  },

  filterProducts: async (filters: {
    search?: string
    categoryId?: number
    ivaRate?: string
    minPrice?: number
    maxPrice?: number
    page?: number
    size?: number
  }): Promise<Page<Product>> => {
    const response = await apiClient.get('/products/filter', { params: filters })
    return response.data
  },

  getPaginatedProducts: async (page = 0, size = 10, sortBy = 'name', sortDir = 'asc') => {
    const response = await apiClient.get('/products/paginated', {
      params: { page, size, sortBy, sortDir }
    })
    return response.data
  },
}
