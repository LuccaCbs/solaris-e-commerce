import apiClient from './axiosClient'
import { ProductForm, ProductFormRequest } from '../types/productForm'

export const productFormService = {
  getAll: async (): Promise<ProductForm[]> => {
    const response = await apiClient.get('/product-forms')
    return response.data
  },

  getByProduct: async (productId: number): Promise<ProductForm> => {
    const response = await apiClient.get(`/product-forms/by-product/${productId}`)
    return response.data
  },

  create: async (data: ProductFormRequest): Promise<ProductForm> => {
    const response = await apiClient.post('/product-forms', data)
    return response.data
  },

  update: async (id: number, data: ProductFormRequest): Promise<ProductForm> => {
    const response = await apiClient.put(`/product-forms/${id}`, data)
    return response.data
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/product-forms/${id}`)
  },
}
