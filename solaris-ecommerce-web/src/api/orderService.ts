import apiClient from './axiosClient'
import { Order, OrderStatus, Page, UnopenedOrdersSummary } from '../types/order'

export const orderService = {
  getAllOrders: async (page = 0, size = 10): Promise<Page<Order>> => {
    const response = await apiClient.get('/orders', { params: { page, size, sortBy: 'createdAt', sortDir: 'desc' } })
    return response.data
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/status`, null, { params: { status } })
    return response.data
  },

  getUnopenedSummary: async (): Promise<UnopenedOrdersSummary> => {
    const response = await apiClient.get('/orders/unopened/summary')
    return response.data
  },

  markOrderAsViewed: async (id: number): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/mark-viewed`)
    return response.data
  },
}
