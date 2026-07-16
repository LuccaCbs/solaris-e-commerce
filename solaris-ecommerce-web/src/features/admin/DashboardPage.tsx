import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { dashboardService } from '../../api/dashboardService'
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  ClipboardList,
  ArrowRight,
  Bell,
} from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'

const formatDate = (value: string) => new Date(value).toLocaleString()

const DashboardPage = () => {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const cards = [
    {
      title: t('admin.dashboard.monthlyRevenue'),
      value: `$${stats?.monthlyRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: t('admin.dashboard.monthlyOrders'),
      value: stats?.monthlyOrders || 0,
      icon: ShoppingCart,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: t('admin.dashboard.totalProducts'),
      value: stats?.totalProducts || 0,
      icon: Package,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: t('admin.dashboard.totalCustomers'),
      value: stats?.totalCustomers || 0,
      icon: Users,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ]

  const orderStatusConfig = {
    PENDING: { labelKey: 'admin.orders.statuses.PENDING', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    CONFIRMED: { labelKey: 'admin.orders.statuses.CONFIRMED', color: 'bg-teal-100 text-teal-800', icon: CheckCircle },
    PROCESSING: { labelKey: 'admin.orders.statuses.PROCESSING', color: 'bg-blue-100 text-blue-800', icon: Loader },
    SHIPPED: { labelKey: 'admin.orders.statuses.SHIPPED', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
    DELIVERED: { labelKey: 'admin.orders.statuses.DELIVERED', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELLED: { labelKey: 'admin.orders.statuses.CANCELLED', color: 'bg-red-100 text-red-800', icon: XCircle },
    REFUNDED: { labelKey: 'admin.orders.statuses.REFUNDED', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  }

  const unopenedOrders = stats?.unopenedOrders ?? 0
  const recentUnopened = stats?.recentUnopenedOrders ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {unopenedOrders > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">
                    {t('admin.dashboard.unopenedOrders', { count: unopenedOrders })}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {t('admin.dashboard.unopenedOrdersMessage')}
                  </p>
                </div>
              </div>
              <Link
                to="/admin/orders"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <ClipboardList className="w-4 h-4" />
                {t('admin.dashboard.viewOrders')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {(stats?.lowStockProducts ?? 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {t('admin.dashboard.lowStockAlert', { count: stats?.lowStockProducts ?? 0 })}
              </p>
              <p className="text-sm text-yellow-700">{t('admin.dashboard.lowStockMessage')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.dashboard.unopenedOrdersTitle')}</h2>
              <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {t('admin.dashboard.viewAllOrders')}
              </Link>
            </div>

            {recentUnopened.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t('admin.dashboard.noUnopenedOrders')}</p>
            ) : (
              <div className="space-y-3">
                {recentUnopened.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders?open=${order.id}`}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                      <span className="text-xs font-medium text-blue-700">{t('admin.orders.unopened')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.ordersByStatus')}</h2>
            <div className="space-y-3">
              {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => {
                const config = orderStatusConfig[status as keyof typeof orderStatusConfig]
                if (!config || count === 0) return null
                const Icon = config.icon
                return (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{t(config.labelKey)}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count as number}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.dashboard.todayStats')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{t('admin.dashboard.dailyRevenue')}</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${stats?.dailyRevenue?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{t('admin.dashboard.dailyOrders')}</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats?.dailyOrders || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
