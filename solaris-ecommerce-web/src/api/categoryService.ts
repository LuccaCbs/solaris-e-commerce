import apiClient from './axiosClient'
import { Category } from '../types/category'

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories')
    return response.data
  },

  getGeneralCategory: async (): Promise<Category> => {
    const response = await apiClient.get('/categories/general')
    return response.data
  },

  getCategoryTree: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories/tree')
    return response.data
  },

  getFilterTree: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories/filter-tree')
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

  toggleStatus: async (id: number, active: boolean): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}/status`, null, { params: { active } })
    return response.data
  },
}
