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
  Loader
} from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'

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
      title: t('admin.dashboard.totalOrders'),
      value: `$${stats?.monthlyRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: t('admin.dashboard.totalOrders'),
      value: stats?.monthlyOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: t('admin.dashboard.totalProducts'),
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: t('admin.dashboard.totalCustomers'),
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ]

  const orderStatusConfig = {
    PENDING: { label: 'Pendientes', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    PROCESSING: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800', icon: Loader },
    SHIPPED: { label: 'Enviados', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
    DELIVERED: { label: 'Entregados', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELLED: { label: 'Cancelados', color: 'bg-red-100 text-red-800', icon: XCircle },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI Cards */}
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

        {/* Low Stock Alert */}
        {stats?.lowStockProducts > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {stats.lowStockProducts} productos con bajo stock
              </p>
              <p className="text-sm text-yellow-700">
                Revisa el inventario para evitar desabastecimientos
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Estado</h2>
            <div className="space-y-3">
              {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => {
                const config = orderStatusConfig[status as keyof typeof orderStatusConfig]
                if (!config || count === 0) return null
                const Icon = config.icon
                return (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count as number}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Hoy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Ingresos del día</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${stats?.dailyRevenue?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Pedidos del día</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.dailyOrders || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
