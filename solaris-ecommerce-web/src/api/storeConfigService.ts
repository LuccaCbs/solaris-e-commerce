import apiClient from './axiosClient'

export const storeConfigService = {
  getAllConfigs: async (): Promise<any[]> => {
    const response = await apiClient.get('/store-config')
    return response.data
  },

  getConfigsByCategory: async (category: string): Promise<any[]> => {
    const response = await apiClient.get(`/store-config/category/${category}`)
    return response.data
  },

  getConfigByKey: async (key: string): Promise<any> => {
    const response = await apiClient.get(`/store-config/key/${key}`)
    return response.data
  },

  createConfig: async (data: any): Promise<any> => {
    const response = await apiClient.post('/store-config', data)
    return response.data
  },

  updateConfig: async (key: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/store-config/key/${key}`, data)
    return response.data
  },

  deleteConfig: async (key: string): Promise<void> => {
    await apiClient.delete(`/store-config/key/${key}`)
  },
}
