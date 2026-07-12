import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Palette, Save, RefreshCw, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { storeConfigService } from '../../api/storeConfigService'
import { fileToBase64, toImageSrc } from '../../api/productImageService'
import { THEME_PRESETS } from '../../context/ThemeContext'
import LanguageSelector from '../../components/LanguageSelector'

const AppearanceConfigPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: configs, isLoading } = useQuery({
    queryKey: ['store-config', 'appearance'],
    queryFn: () => storeConfigService.getConfigsByCategory('appearance'),
  })

  const configMap = new Map(configs?.map((c) => [c.configKey, c.configValue]) || [])

  const [formData, setFormData] = useState({
    theme: configMap.get('appearance.theme') || 'LIGHT_YELLOW',
    primaryColor: configMap.get('appearance.primary_color') || '#facc15',
    secondaryColor: configMap.get('appearance.secondary_color') || '#111827',
    accentColor: configMap.get('appearance.accent_color') || '#ffffff',
    heroTitle: configMap.get('appearance.hero_title') || '',
    heroSubtitle: configMap.get('appearance.hero_subtitle') || '',
    heroImages: (() => {
      try {
        return JSON.parse(configMap.get('appearance.hero_images') || '[]')
      } catch {
        return []
      }
    })(),
  })

  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      storeConfigService.updateConfig(key, { configKey: key, configValue: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-config'] })
      toast.success(t('admin.appearance.updated'))
    },
    onError: () => {
      toast.error(t('admin.appearance.error'))
    },
  })

  const handlePresetSelect = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setFormData({
        ...formData,
        theme: presetId,
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        accentColor: preset.accentColor,
      })
    }
  }

  const handleImageSelect = async (files: FileList | null) => {
    if (!files?.length) return
    const newFiles = Array.from(files)
    setPendingFiles([...pendingFiles, ...newFiles])
  }

  const handleRemoveImage = (index: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const heroImagesBase64 = [...formData.heroImages]
    for (const file of pendingFiles) {
      const base64 = await fileToBase64(file)
      heroImagesBase64.push(base64)
    }

    const updates = [
      { key: 'appearance.theme', value: formData.theme },
      { key: 'appearance.primary_color', value: formData.primaryColor },
      { key: 'appearance.secondary_color', value: formData.secondaryColor },
      { key: 'appearance.accent_color', value: formData.accentColor },
      { key: 'appearance.hero_title', value: formData.heroTitle },
      { key: 'appearance.hero_subtitle', value: formData.heroSubtitle },
      { key: 'appearance.hero_images', value: JSON.stringify(heroImagesBase64) },
    ]

    for (const update of updates) {
      updateMutation.mutate(update)
    }
    setPendingFiles([])
  }

  const handleReset = () => {
    if (configs) {
      const resetData = {
        theme: configMap.get('appearance.theme') || 'LIGHT_YELLOW',
        primaryColor: configMap.get('appearance.primary_color') || '#facc15',
        secondaryColor: configMap.get('appearance.secondary_color') || '#111827',
        accentColor: configMap.get('appearance.accent_color') || '#ffffff',
        heroTitle: configMap.get('appearance.hero_title') || '',
        heroSubtitle: configMap.get('appearance.hero_subtitle') || '',
        heroImages: (() => {
          try {
            return JSON.parse(configMap.get('appearance.hero_images') || '[]')
          } catch {
            return []
          }
        })(),
      }
      setFormData(resetData)
      setPendingFiles([])
    }
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
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.appearance.title')}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('admin.appearance.reset')}
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {t('admin.appearance.save')}
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.appearance.themePresets')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.theme === preset.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: preset.secondaryColor }}
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{preset.id}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.appearance.customColors')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.primaryColor')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.secondaryColor')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.accentColor')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.appearance.heroBanner')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.heroTitle')}</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.heroSubtitle')}</label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.heroImages')}</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageSelect(e.target.files)}
                  className="hidden"
                  id="hero-image-upload"
                />
                <label
                  htmlFor="hero-image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {t('admin.appearance.uploadImages')}
                </label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.heroImages.map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img src={toImageSrc(img)} alt={`Hero ${idx}`} className="w-20 h-20 rounded object-cover border" />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.heroImages.filter((_: string, i: number) => i !== idx)
                          setFormData({ ...formData, heroImages: newImages })
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {pendingFiles.map((file, idx) => (
                    <div key={`pending-${idx}`} className="relative group">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 rounded object-cover border" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AppearanceConfigPage
