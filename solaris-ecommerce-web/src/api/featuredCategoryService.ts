import apiClient from './axiosClient'

export type FeaturedCategory = {
  id: number
  categoryId: number
  name: string
  description?: string
  imageData?: string | null
  displayOrder: number
  active: boolean
}

export type FeaturedCategoryRequest = {
  categoryId: number
  displayOrder?: number
  active?: boolean
}

export const featuredCategoryService = {
  getAll: async (): Promise<FeaturedCategory[]> => {
    const response = await apiClient.get('/featured-categories')
    return response.data
  },

  getPublic: async (): Promise<FeaturedCategory[]> => {
    const response = await apiClient.get('/public/featured-categories')
    return response.data
  },

  create: async (data: FeaturedCategoryRequest): Promise<FeaturedCategory> => {
    const response = await apiClient.post('/featured-categories', data)
    return response.data
  },

  update: async (id: number, data: Partial<FeaturedCategoryRequest>): Promise<FeaturedCategory> => {
    const response = await apiClient.put(`/featured-categories/${id}`, data)
    return response.data
  },

  toggleStatus: async (id: number, active: boolean): Promise<FeaturedCategory> => {
    const response = await apiClient.patch(`/featured-categories/${id}/status`, null, { params: { active } })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/featured-categories/${id}`)
  },
}
