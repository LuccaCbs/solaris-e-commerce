import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { orderService } from '../api/orderService'

export const useOrderNotifications = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const lastCountRef = useRef<number | null>(null)

  const { data } = useQuery({
    queryKey: ['unopened-orders-summary'],
    queryFn: orderService.getUnopenedSummary,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (!data) return

    if (lastCountRef.current !== null && data.count > lastCountRef.current) {
      const orderNumber = data.latestOrder?.orderNumber ?? ''
      toast.success(t('admin.orders.newOrderNotification', { orderNumber }), {
        duration: 6000,
      })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }

    lastCountRef.current = data.count
  }, [data, queryClient, t])

  return {
    unopenedCount: data?.count ?? 0,
  }
}
