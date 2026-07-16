import apiClient from './axiosClient'
import { DashboardStats } from '../types/dashboard'

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },
}
