export type OrderSummary = {
  id: number
  orderNumber: string
  totalAmount: number
  createdAt: string
  viewedByAdmin?: boolean
  userName?: string
  userEmail?: string
}

export type DashboardStats = {
  totalProducts: number
  lowStockProducts: number
  totalCustomers: number
  totalOrders: number
  ordersByStatus: Record<string, number>
  monthlyRevenue: number
  dailyRevenue: number
  monthlyOrders: number
  dailyOrders: number
  unopenedOrders: number
  recentUnopenedOrders: OrderSummary[]
}

export type UnopenedOrdersSummary = {
  count: number
  latestOrder?: {
    id: number
    orderNumber: string
    totalAmount: number
    createdAt: string
  }
}
