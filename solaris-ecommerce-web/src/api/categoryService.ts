import apiClient from './axiosClient'
import { Category } from '../types/category'

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories')
    return response.data
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  },

  createCategory: async (data: any): Promise<Category> => {
    const response = await apiClient.post('/categories', data)
    return response.data
  },

  updateCategory: async (id: number, data: any): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
