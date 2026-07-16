import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { orderService } from '../../api/orderService'
import { Order, ORDER_STATUSES, OrderStatus } from '../../types/order'
import { ClipboardList, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'
import LanguageSelector from '../../components/LanguageSelector'

const formatDate = (value: string) => {
  return new Date(value).toLocaleString()
}

const OrdersManagementPage = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const queryClient = useQueryClient()
  const openedFromQueryRef = useRef<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderService.getAllOrders(page, 10),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setSelectedOrder(updatedOrder)
      toast.success(t('admin.orders.statusUpdated'))
    },
    onError: () => {
      toast.error(t('admin.orders.error'))
    },
  })

  const handleViewOrder = async (order: Order) => {
    try {
      const fullOrder = order.viewedByAdmin
        ? await orderService.getOrderById(order.id)
        : await orderService.markOrderAsViewed(order.id)
      setSelectedOrder(fullOrder)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['unopened-orders-summary'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    } catch {
      toast.error(t('admin.orders.error'))
    }
  }

  useEffect(() => {
    const openId = searchParams.get('open')
    if (!openId || openedFromQueryRef.current === openId) return

    openedFromQueryRef.current = openId
    const orderId = Number(openId)
    if (!orderId) return

    const openFromQuery = async () => {
      try {
        const fullOrder = await orderService.markOrderAsViewed(orderId)
        setSelectedOrder(fullOrder)
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['unopened-orders-summary'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      } catch {
        try {
          const fullOrder = await orderService.getOrderById(orderId)
          setSelectedOrder(fullOrder)
        } catch {
          toast.error(t('admin.orders.error'))
        }
      } finally {
        setSearchParams({}, { replace: true })
      }
    }

    openFromQuery()
  }, [searchParams, setSearchParams, queryClient, t])

  const getCustomerLabel = (order: Order) => {
    if (order.customerName) return order.customerName
    if (order.userName) return order.userName
    if (order.userEmail) return order.userEmail
    return t('admin.orders.unknownCustomer')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.orders.title')}</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">{t('common.loading')}</div>
          ) : !data?.content.length ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.orders.noOrders')}</h2>
              <p className="text-gray-600 mt-1">{t('admin.orders.noOrdersMessage')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orders.orderNumber')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orders.date')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orders.customer')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orders.status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.orders.total')}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.product.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.content.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 ${!order.viewedByAdmin ? 'bg-blue-50/40' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {order.orderNumber}
                            {!order.viewedByAdmin && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                {t('admin.orders.unopened')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getCustomerLabel(order)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                            {t(`admin.orders.statuses.${order.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            {t('admin.actions.view')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                  >
                    {t('admin.orders.previous')}
                  </button>
                  <span className="text-sm text-gray-600">
                    {page + 1} / {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.totalPages - 1}
                    className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
                  >
                    {t('admin.orders.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t('admin.orders.customer')}</p>
                  <p className="font-medium text-gray-900">{getCustomerLabel(selectedOrder)}</p>
                  {selectedOrder.userEmail && (
                    <p className="text-sm text-gray-600">{selectedOrder.userEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">{t('admin.orders.status')}</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      statusMutation.mutate({
                        id: selectedOrder.id,
                        status: e.target.value as OrderStatus,
                      })
                    }
                    disabled={statusMutation.isPending}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t(`admin.orders.statuses.${status}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('admin.orders.items')}</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          {item.productBarcode && (
                            <p className="text-xs text-gray-500">{item.productBarcode}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            {t('cart.quantity')}: {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">${item.totalPrice.toFixed(2)}</p>
                      </div>

                      {item.details && item.details.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {t('admin.orders.customization')}
                          </p>
                          <ul className="space-y-1">
                            {item.details.map((detail) => (
                              <li key={detail.id} className="text-sm text-gray-700">
                                <span className="font-medium">{detail.fieldLabel}:</span> {detail.fieldValue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-semibold text-gray-900">{t('admin.orders.total')}</span>
                <span className="text-xl font-bold text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersManagementPage
