import apiClient from './axiosClient'
import { Customer } from '../types/customer'

export const customerService = {
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get('/customers')
    return response.data
  },

  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data
  },

  searchCustomers: async (term: string): Promise<Customer[]> => {
    const response = await apiClient.get('/customers/search', { params: { term } })
    return response.data
  },

  createCustomer: async (data: any): Promise<Customer> => {
    const response = await apiClient.post('/customers', data)
    return response.data
  },

  updateCustomer: async (id: number, data: any): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${id}`, data)
    return response.data
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`)
  },
}
