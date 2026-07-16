import { Page } from './product'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type ProductOrderDetail = {
  id: number
  orderId?: number
  orderItemId?: number
  productId?: number
  productFormFieldId?: number
  fieldKey: string
  fieldLabel: string
  fieldValue: string
}

export type OrderItem = {
  id: number
  productId?: number
  productName: string
  productBarcode?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  details?: ProductOrderDetail[]
}

export type Order = {
  id: number
  orderNumber: string
  customerId?: number | null
  customerName?: string | null
  userId?: number | null
  userName?: string | null
  userEmail?: string | null
  status: OrderStatus
  totalAmount: number
  subtotal: number
  taxAmount?: number
  shippingAmount?: number
  shippingAddress?: string
  billingAddress?: string
  paymentMethod?: string
  paymentReference?: string
  notes?: string
  createdAt: string
  updatedAt?: string
  viewedByAdmin?: boolean
  items: OrderItem[]
}

export type CheckoutResponse = {
  orderId: number
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  paymentReference?: string
  items: OrderItem[]
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

export type { Page }

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]
