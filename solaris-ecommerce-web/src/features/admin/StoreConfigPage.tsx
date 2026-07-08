import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { storeConfigService } from '../../api/storeConfigService'
import { Save, RefreshCw, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import LanguageSelector from '../../components/LanguageSelector'

const StoreConfigPage = () => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const { data: configs, isLoading } = useQuery({
    queryKey: ['store-config', selectedCategory],
    queryFn: () => storeConfigService.getConfigsByCategory(selectedCategory),
  })

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      storeConfigService.updateConfig(key, { configKey: key, configValue: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-config'] })
      toast.success(t('admin.config.updated'))
    },
    onError: () => {
      toast.error(t('admin.config.error'))
    },
  })

  const handleSave = () => {
    Object.entries(formData).forEach(([key, value]) => {
      updateMutation.mutate({ key, value })
    })
  }

  const handleReset = () => {
    if (configs) {
      const resetData: Record<string, string> = {}
      configs.forEach((config) => {
        resetData[config.configKey] = config.configValue
      })
      setFormData(resetData)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const categories = [
    { id: 'general', name: t('admin.config.general') },
    { id: 'tax', name: t('admin.config.tax') },
    { id: 'payment', name: t('admin.config.payment') },
    { id: 'shipping', name: t('admin.config.shipping') },
  ]

  const configLabels: Record<string, string> = {
    'store.name': t('admin.config.storeName'),
    'store.email': t('admin.config.storeEmail'),
    'store.phone': t('admin.config.storePhone'),
    'store.currency': t('admin.config.storeCurrency'),
    'store.tax_rate': t('admin.config.taxRate'),
    'payment.mercadopago.enabled': t('admin.config.mercadopagoEnabled'),
    'payment.stripe.enabled': t('admin.config.stripeEnabled'),
    'shipping.default_cost': t('admin.config.defaultShippingCost'),
    'shipping.free_shipping_threshold': t('admin.config.freeShippingThreshold'),
  }

  const configTypes: Record<string, 'text' | 'number' | 'boolean'> = {
    'store.name': 'text',
    'store.email': 'text',
    'store.phone': 'text',
    'store.currency': 'text',
    'store.tax_rate': 'number',
    'payment.mercadopago.enabled': 'boolean',
    'payment.stripe.enabled': 'boolean',
    'shipping.default_cost': 'number',
    'shipping.free_shipping_threshold': 'number',
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.config.title')}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('admin.config.reset')}
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {t('admin.config.save')}
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de categorías */}
          <div className="bg-white rounded-lg shadow p-4">
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Panel de configuración */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
              </div>

              {configs && configs.length > 0 ? (
                <div className="space-y-6">
                  {configs.map((config) => {
                    const inputType = configTypes[config.configKey] || 'text'
                    const label = configLabels[config.configKey] || config.configKey
                    const currentValue = formData[config.configKey] ?? config.configValue

                    return (
                      <div key={config.configKey}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {label}
                        </label>
                        {inputType === 'boolean' ? (
                          <select
                            value={currentValue}
                            onChange={(e) => handleInputChange(config.configKey, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="true">{t('common.yes')}</option>
                            <option value="false">{t('common.no')}</option>
                          </select>
                        ) : (
                          <input
                            type={inputType}
                            value={currentValue}
                            onChange={(e) => handleInputChange(config.configKey, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {config.description && (
                          <p className="mt-1 text-sm text-gray-500">{config.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('admin.config.noConfig')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default StoreConfigPage
