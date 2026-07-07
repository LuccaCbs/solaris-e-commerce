import apiClient from './axiosClient'

export const dashboardService = {
  getDashboardStats: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },
}
