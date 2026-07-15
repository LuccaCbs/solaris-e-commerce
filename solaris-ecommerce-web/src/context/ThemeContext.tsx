import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { storeConfigService } from '../api/storeConfigService'

export type ThemePreset = {
  id: string
  name?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'LIGHT_YELLOW', name: 'LIGHT_YELLOW', primaryColor: '#facc15', secondaryColor: '#111827', accentColor: '#ffffff' },
  { id: 'BEIGE_PURPLE', name: 'BEIGE_PURPLE', primaryColor: '#e8d9c5', secondaryColor: '#5b3a70', accentColor: '#faf6f0' },
  { id: 'WHITE_BLUE', name: 'WHITE_BLUE', primaryColor: '#dbeafe', secondaryColor: '#1e3a8a', accentColor: '#ffffff' },
  { id: 'SAGE_TERRACOTTA', name: 'SAGE_TERRACOTTA', primaryColor: '#c9d6bb', secondaryColor: '#a15c43', accentColor: '#f7f5ef' },
]

export const parseCustomThemes = (json: string | undefined): ThemePreset[] => {
  try {
    const parsed = JSON.parse(json || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t) => t?.id && t?.primaryColor && t?.secondaryColor && t?.accentColor
    )
  } catch {
    return []
  }
}

export const getAllThemes = (customThemesJson?: string): ThemePreset[] => [
  ...THEME_PRESETS,
  ...parseCustomThemes(customThemesJson),
]

type AppearanceConfig = {
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
}

const defaultAppearance: AppearanceConfig = {
  theme: 'LIGHT_YELLOW',
  primaryColor: '#facc15',
  secondaryColor: '#111827',
  accentColor: '#ffffff',
  heroTitle: '',
  heroSubtitle: '',
  heroImages: [],
  aboutUsTitle: '',
  aboutUsText: '',
  contactPhone: '',
  contactEmail: '',
  instagramEnabled: false,
  instagramUrl: '',
  facebookEnabled: false,
  facebookUrl: '',
  linkedinEnabled: false,
  linkedinUrl: '',
}

const ThemeContext = createContext<AppearanceConfig>(defaultAppearance)

export const useAppearance = () => useContext(ThemeContext)

const parseConfigList = (configs: any[] | undefined): AppearanceConfig => {
  if (!configs?.length) return defaultAppearance
  const map = new Map(configs.map((c) => [c.configKey, c.configValue]))
  let heroImages: string[] = []
  try {
    heroImages = JSON.parse(map.get('appearance.hero_images') || '[]')
  } catch {
    heroImages = []
  }
  return {
    theme: map.get('appearance.theme') || defaultAppearance.theme,
    primaryColor: map.get('appearance.primary_color') || defaultAppearance.primaryColor,
    secondaryColor: map.get('appearance.secondary_color') || defaultAppearance.secondaryColor,
    accentColor: map.get('appearance.accent_color') || defaultAppearance.accentColor,
    heroTitle: map.get('appearance.hero_title') || '',
    heroSubtitle: map.get('appearance.hero_subtitle') || '',
    heroImages,
    aboutUsTitle: map.get('appearance.about_us_title') || '',
    aboutUsText: map.get('appearance.about_us_text') || '',
    contactPhone: map.get('appearance.contact_phone') || '',
    contactEmail: map.get('appearance.contact_email') || '',
    instagramEnabled: map.get('appearance.instagram_enabled') === 'true',
    instagramUrl: map.get('appearance.instagram_url') || '',
    facebookEnabled: map.get('appearance.facebook_enabled') === 'true',
    facebookUrl: map.get('appearance.facebook_url') || '',
    linkedinEnabled: map.get('appearance.linkedin_enabled') === 'true',
    linkedinUrl: map.get('appearance.linkedin_url') || '',
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { data: configs } = useQuery({
    queryKey: ['store-config', 'appearance'],
    queryFn: () => storeConfigService.getConfigsByCategory('appearance'),
    staleTime: 5 * 60 * 1000,
  })

  const appearance = parseConfigList(configs)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', appearance.primaryColor)
    root.style.setProperty('--color-secondary', appearance.secondaryColor)
    root.style.setProperty('--color-accent', appearance.accentColor)
  }, [appearance.primaryColor, appearance.secondaryColor, appearance.accentColor])

  return <ThemeContext.Provider value={appearance}>{children}</ThemeContext.Provider>
}
