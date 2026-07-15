import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Palette, Save, RefreshCw, Upload, X, Plus, Trash2, MapPin, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { storeConfigService } from '../../api/storeConfigService'
import { fileToBase64, toImageSrc } from '../../api/productImageService'
import {
  THEME_PRESETS,
  ThemePreset,
  parseCustomThemes,
} from '../../context/ThemeContext'
import LanguageSelector from '../../components/LanguageSelector'
import { isAxiosError } from 'axios'
import GoogleMapEmbed from '../../components/GoogleMapEmbed'
import { hasMapLocation } from '../../utils/googleMaps'
import { geocodeAddress } from '../../utils/geocode'

type FormData = {
  theme: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  heroTitle: string
  heroSubtitle: string
  heroImages: string[]
  aboutUsTitle: string
  aboutUsText: string
  contactPhone: string
  contactEmail: string
  instagramEnabled: boolean
  instagramUrl: string
  facebookEnabled: boolean
  facebookUrl: string
  linkedinEnabled: boolean
  linkedinUrl: string
  mapEnabled: boolean
  mapAddress: string
  mapLatitude: string
  mapLongitude: string
  mapZoom: string
}

const buildFormData = (configMap: Map<string, string>): FormData => ({
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
  aboutUsTitle: configMap.get('appearance.about_us_title') || '',
  aboutUsText: configMap.get('appearance.about_us_text') || '',
  contactPhone: configMap.get('appearance.contact_phone') || '',
  contactEmail: configMap.get('appearance.contact_email') || '',
  instagramEnabled: configMap.get('appearance.instagram_enabled') === 'true',
  instagramUrl: configMap.get('appearance.instagram_url') || '',
  facebookEnabled: configMap.get('appearance.facebook_enabled') === 'true',
  facebookUrl: configMap.get('appearance.facebook_url') || '',
  linkedinEnabled: configMap.get('appearance.linkedin_enabled') === 'true',
  linkedinUrl: configMap.get('appearance.linkedin_url') || '',
  mapEnabled: configMap.get('appearance.map_enabled') === 'true',
  mapAddress: configMap.get('appearance.map_address') || '',
  mapLatitude: configMap.get('appearance.map_latitude') || '',
  mapLongitude: configMap.get('appearance.map_longitude') || '',
  mapZoom: configMap.get('appearance.map_zoom') || '15',
})

const CONFIG_FIELD_KEYS: Record<string, keyof FormData | 'customThemes'> = {
  'appearance.theme': 'theme',
  'appearance.primary_color': 'primaryColor',
  'appearance.secondary_color': 'secondaryColor',
  'appearance.accent_color': 'accentColor',
  'appearance.hero_title': 'heroTitle',
  'appearance.hero_subtitle': 'heroSubtitle',
  'appearance.hero_images': 'heroImages',
  'appearance.about_us_title': 'aboutUsTitle',
  'appearance.about_us_text': 'aboutUsText',
  'appearance.contact_phone': 'contactPhone',
  'appearance.contact_email': 'contactEmail',
  'appearance.instagram_enabled': 'instagramEnabled',
  'appearance.instagram_url': 'instagramUrl',
  'appearance.facebook_enabled': 'facebookEnabled',
  'appearance.facebook_url': 'facebookUrl',
  'appearance.linkedin_enabled': 'linkedinEnabled',
  'appearance.linkedin_url': 'linkedinUrl',
  'appearance.custom_themes': 'customThemes',
  'appearance.map_enabled': 'mapEnabled',
  'appearance.map_address': 'mapAddress',
  'appearance.map_latitude': 'mapLatitude',
  'appearance.map_longitude': 'mapLongitude',
  'appearance.map_zoom': 'mapZoom',
}

const AppearanceConfigPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: configs, isLoading } = useQuery({
    queryKey: ['store-config', 'appearance'],
    queryFn: () => storeConfigService.getConfigsByCategory('appearance'),
  })

  const [formData, setFormData] = useState<FormData>(() => buildFormData(new Map()))
  const [customThemes, setCustomThemes] = useState<ThemePreset[]>([])
  const [newThemeName, setNewThemeName] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (configs?.length && !hasInitialized.current) {
      hasInitialized.current = true
      const map = new Map(configs.map((c) => [c.configKey, c.configValue]))
      setFormData(buildFormData(map))
      setCustomThemes(parseCustomThemes(map.get('appearance.custom_themes')))
    }
  }, [configs])

  const allThemes = [...THEME_PRESETS, ...customThemes]

  const getFieldLabel = (configKey: string): string => {
    const field = CONFIG_FIELD_KEYS[configKey]
    const labels: Record<string, string> = {
      theme: t('admin.appearance.themePresets'),
      primaryColor: t('admin.appearance.primaryColor'),
      secondaryColor: t('admin.appearance.secondaryColor'),
      accentColor: t('admin.appearance.accentColor'),
      heroTitle: t('admin.appearance.heroTitle'),
      heroSubtitle: t('admin.appearance.heroSubtitle'),
      heroImages: t('admin.appearance.heroImages'),
      aboutUsTitle: t('admin.appearance.aboutUsTitle'),
      aboutUsText: t('admin.appearance.aboutUsText'),
      contactPhone: t('admin.appearance.contactPhone'),
      contactEmail: t('admin.appearance.contactEmail'),
      instagramEnabled: 'Instagram',
      instagramUrl: 'Instagram URL',
      facebookEnabled: 'Facebook',
      facebookUrl: 'Facebook URL',
      linkedinEnabled: 'LinkedIn',
      linkedinUrl: 'LinkedIn URL',
      customThemes: t('admin.appearance.customThemes'),
      mapEnabled: t('admin.appearance.mapEnabled'),
      mapAddress: t('admin.appearance.mapAddress'),
      mapLatitude: t('admin.appearance.mapLatitude'),
      mapLongitude: t('admin.appearance.mapLongitude'),
      mapZoom: t('admin.appearance.mapZoom'),
    }
    return field ? labels[field] || configKey : configKey
  }

  const extractErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
      return error.response?.data?.message || error.message
    }
    if (error instanceof Error) return error.message
    return t('admin.appearance.errorUnknown')
  }

  const handlePresetSelect = (preset: ThemePreset) => {
    setFormData({
      ...formData,
      theme: preset.id,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
    })
  }

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleAddTheme = () => {
    const name = newThemeName.trim()
    if (!name) {
      toast.error(t('admin.appearance.themeNameRequired'))
      return
    }
    const id = `CUSTOM_${Date.now()}`
    const newTheme: ThemePreset = {
      id,
      name,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      accentColor: formData.accentColor,
    }
    setCustomThemes([...customThemes, newTheme])
    setFormData({ ...formData, theme: id })
    setNewThemeName('')
    toast.success(t('admin.appearance.themeAdded'))
  }

  const handleDeleteTheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = customThemes.filter((t) => t.id !== themeId)
    setCustomThemes(updated)
    if (formData.theme === themeId) {
      const fallback = THEME_PRESETS[0]
      setFormData({
        ...formData,
        theme: fallback.id,
        primaryColor: fallback.primaryColor,
        secondaryColor: fallback.secondaryColor,
        accentColor: fallback.accentColor,
      })
    }
  }

  const getThemePreviewColors = (preset: ThemePreset) => {
    if (formData.theme === preset.id) {
      return {
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
      }
    }
    return {
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
    }
  }

  const handleGeocodeAddress = async () => {
    if (!formData.mapAddress.trim()) {
      toast.error(t('admin.appearance.mapAddressRequired'))
      return
    }
    setIsGeocoding(true)
    try {
      const result = await geocodeAddress(formData.mapAddress)
      if (!result) {
        toast.error(t('admin.appearance.mapGeocodeNotFound'))
        return
      }
      setFormData({
        ...formData,
        mapLatitude: result.latitude,
        mapLongitude: result.longitude,
        mapEnabled: true,
      })
      toast.success(t('admin.appearance.mapGeocodeSuccess'))
    } catch {
      toast.error(t('admin.appearance.mapGeocodeError'))
    } finally {
      setIsGeocoding(false)
    }
  }

  const showMapPreview = hasMapLocation(formData)

  const handleImageSelect = async (files: FileList | null) => {
    if (!files?.length) return
    setPendingFiles([...pendingFiles, ...Array.from(files)])
  }

  const handleRemoveImage = (index: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const heroImagesBase64 = [...formData.heroImages]
      for (const file of pendingFiles) {
        heroImagesBase64.push(await fileToBase64(file))
      }

      const updatedCustomThemes = customThemes.map((theme) =>
        theme.id === formData.theme
          ? {
              ...theme,
              primaryColor: formData.primaryColor,
              secondaryColor: formData.secondaryColor,
              accentColor: formData.accentColor,
            }
          : theme
      )

      const updates: { key: string; value: string }[] = [
        { key: 'appearance.theme', value: formData.theme },
        { key: 'appearance.primary_color', value: formData.primaryColor },
        { key: 'appearance.secondary_color', value: formData.secondaryColor },
        { key: 'appearance.accent_color', value: formData.accentColor },
        { key: 'appearance.hero_title', value: formData.heroTitle },
        { key: 'appearance.hero_subtitle', value: formData.heroSubtitle },
        { key: 'appearance.hero_images', value: JSON.stringify(heroImagesBase64) },
        { key: 'appearance.about_us_title', value: formData.aboutUsTitle },
        { key: 'appearance.about_us_text', value: formData.aboutUsText },
        { key: 'appearance.contact_phone', value: formData.contactPhone },
        { key: 'appearance.contact_email', value: formData.contactEmail },
        { key: 'appearance.instagram_enabled', value: String(formData.instagramEnabled) },
        { key: 'appearance.instagram_url', value: formData.instagramUrl },
        { key: 'appearance.facebook_enabled', value: String(formData.facebookEnabled) },
        { key: 'appearance.facebook_url', value: formData.facebookUrl },
        { key: 'appearance.linkedin_enabled', value: String(formData.linkedinEnabled) },
        { key: 'appearance.linkedin_url', value: formData.linkedinUrl },
        { key: 'appearance.map_enabled', value: String(formData.mapEnabled) },
        { key: 'appearance.map_address', value: formData.mapAddress },
        { key: 'appearance.map_latitude', value: formData.mapLatitude },
        { key: 'appearance.map_longitude', value: formData.mapLongitude },
        { key: 'appearance.map_zoom', value: formData.mapZoom },
        { key: 'appearance.custom_themes', value: JSON.stringify(updatedCustomThemes) },
      ]

      const results = await Promise.allSettled(
        updates.map(({ key, value }) =>
          storeConfigService.updateConfig(key, {
            configKey: key,
            configValue: value,
            category: 'appearance',
          })
        )
      )

      const failures: { key: string; message: string }[] = []
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failures.push({
            key: updates[index].key,
            message: extractErrorMessage(result.reason),
          })
        }
      })

      if (failures.length > 0) {
        const failedFields = failures.map((f) => getFieldLabel(f.key)).join(', ')
        const detail = failures.length === 1 ? `: ${failures[0].message}` : ''
        toast.error(`${t('admin.appearance.errorFields', { fields: failedFields })}${detail}`, {
          id: 'appearance-save-error',
          duration: 6000,
        })
        return
      }

      setCustomThemes(updatedCustomThemes)
      setFormData({ ...formData, heroImages: heroImagesBase64 })
      setPendingFiles([])
      queryClient.invalidateQueries({ queryKey: ['store-config'] })
      toast.success(t('admin.appearance.updated'), { id: 'appearance-save-success' })
    } catch {
      toast.error(t('admin.appearance.error'), { id: 'appearance-save-error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (configs) {
      const map = new Map(configs.map((c) => [c.configKey, c.configValue]))
      setFormData(buildFormData(map))
      setCustomThemes(parseCustomThemes(map.get('appearance.custom_themes')))
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
              disabled={isSaving}
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
              {allThemes.map((preset) => {
                const colors = getThemePreviewColors(preset)
                const isCustom = preset.id.startsWith('CUSTOM_')
                return (
                  <div
                    key={preset.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handlePresetSelect(preset)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handlePresetSelect(preset)
                      }
                    }}
                    className={`relative p-4 rounded-lg border-2 transition text-left cursor-pointer ${
                      formData.theme === preset.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTheme(preset.id, e)}
                        className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        title={t('admin.appearance.deleteTheme')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex gap-2 mb-2">
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: colors.primaryColor }} />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: colors.secondaryColor }} />
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: colors.accentColor }}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate pr-4">
                      {preset.name || preset.id}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.addTheme')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder={t('admin.appearance.themeNamePlaceholder')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTheme}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {t('admin.appearance.addThemeButton')}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('admin.appearance.addThemeHint')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.appearance.customColors')}</h2>
            </div>
            <div
              className="mb-4 p-4 rounded-lg border"
              style={{
                backgroundColor: formData.accentColor,
                color: formData.secondaryColor,
                borderColor: formData.primaryColor,
              }}
            >
              <p className="text-sm font-medium">{t('admin.appearance.colorPreview')}</p>
              <div className="mt-2 flex gap-2">
                <span
                  className="px-3 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: formData.primaryColor, color: formData.secondaryColor }}
                >
                  {t('admin.appearance.primaryColor')}
                </span>
                <span
                  className="px-3 py-1 rounded text-sm"
                  style={{ backgroundColor: formData.secondaryColor, color: formData.accentColor }}
                >
                  {t('admin.appearance.secondaryColor')}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.primaryColor')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.secondaryColor')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.accentColor')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.heroTitle')}
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.heroSubtitle')}
                </label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.heroImages')}
                </label>
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
                      <img
                        src={toImageSrc(img)}
                        alt={`Hero ${idx}`}
                        className="w-20 h-20 rounded object-cover border"
                      />
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
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 rounded object-cover border"
                      />
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

          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">{t('admin.appearance.aboutUs')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.aboutUsTitle')}
                </label>
                <input
                  type="text"
                  value={formData.aboutUsTitle}
                  onChange={(e) => setFormData({ ...formData, aboutUsTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.appearance.aboutUsText')}
                </label>
                <textarea
                  value={formData.aboutUsText}
                  onChange={(e) => setFormData({ ...formData, aboutUsText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">{t('admin.appearance.mapLocation')}</h3>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.mapEnabled}
                      onChange={(e) => setFormData({ ...formData, mapEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    {t('admin.appearance.mapEnabled')}
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.appearance.mapAddress')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.mapAddress}
                        onChange={(e) => setFormData({ ...formData, mapAddress: e.target.value })}
                        placeholder={t('admin.appearance.mapAddressPlaceholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleGeocodeAddress}
                        disabled={isGeocoding}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1 text-sm disabled:opacity-50"
                      >
                        <Search className="w-4 h-4" />
                        {isGeocoding ? t('common.loading') : t('admin.appearance.mapSearch')}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('admin.appearance.mapAddressHint')}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.appearance.mapLatitude')}
                      </label>
                      <input
                        type="text"
                        value={formData.mapLatitude}
                        onChange={(e) => setFormData({ ...formData, mapLatitude: e.target.value })}
                        placeholder="40.416775"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.appearance.mapLongitude')}
                      </label>
                      <input
                        type="text"
                        value={formData.mapLongitude}
                        onChange={(e) => setFormData({ ...formData, mapLongitude: e.target.value })}
                        placeholder="-3.703790"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.appearance.mapZoom')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={21}
                        value={formData.mapZoom}
                        onChange={(e) => setFormData({ ...formData, mapZoom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  {showMapPreview && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('admin.appearance.mapPreview')}</p>
                      <div className="w-full h-56 rounded-lg overflow-hidden border border-gray-200">
                        <GoogleMapEmbed
                          latitude={formData.mapLatitude}
                          longitude={formData.mapLongitude}
                          address={formData.mapAddress}
                          zoom={formData.mapZoom}
                          title={t('admin.appearance.mapPreview')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">{t('admin.appearance.contactInfo')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.appearance.contactPhone')}
                    </label>
                    <input
                      type="text"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('admin.appearance.contactEmail')}
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">{t('admin.appearance.socialMedia')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="instagram-enabled"
                      checked={formData.instagramEnabled}
                      onChange={(e) => setFormData({ ...formData, instagramEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="instagram-enabled" className="text-sm text-gray-700">
                      Instagram
                    </label>
                    {formData.instagramEnabled && (
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={formData.instagramUrl}
                        onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="facebook-enabled"
                      checked={formData.facebookEnabled}
                      onChange={(e) => setFormData({ ...formData, facebookEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="facebook-enabled" className="text-sm text-gray-700">
                      Facebook
                    </label>
                    {formData.facebookEnabled && (
                      <input
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={formData.facebookUrl}
                        onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="linkedin-enabled"
                      checked={formData.linkedinEnabled}
                      onChange={(e) => setFormData({ ...formData, linkedinEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="linkedin-enabled" className="text-sm text-gray-700">
                      LinkedIn
                    </label>
                    {formData.linkedinEnabled && (
                      <input
                        type="url"
                        placeholder="https://linkedin.com/..."
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    )}
                  </div>
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
