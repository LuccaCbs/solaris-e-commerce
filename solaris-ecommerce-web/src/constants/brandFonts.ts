export type BrandingMode = 'TEXT' | 'LOGO' | 'TEXT_AND_LOGO'

export type BrandFont = {
  id: string
  label: string
  googleName: string
  cssFamily: string
}

export const BRAND_FONTS: BrandFont[] = [
  {
    id: 'PLAYFAIR_DISPLAY',
    label: 'Playfair Display',
    googleName: 'Playfair+Display:wght@400;600;700',
    cssFamily: "'Playfair Display', Georgia, serif",
  },
  {
    id: 'INTER',
    label: 'Inter',
    googleName: 'Inter:wght@400;600;700',
    cssFamily: "'Inter', system-ui, sans-serif",
  },
  {
    id: 'MONTSERRAT',
    label: 'Montserrat',
    googleName: 'Montserrat:wght@400;600;700',
    cssFamily: "'Montserrat', system-ui, sans-serif",
  },
  {
    id: 'LATO',
    label: 'Lato',
    googleName: 'Lato:wght@400;700',
    cssFamily: "'Lato', system-ui, sans-serif",
  },
  {
    id: 'ROBOTO',
    label: 'Roboto',
    googleName: 'Roboto:wght@400;500;700',
    cssFamily: "'Roboto', system-ui, sans-serif",
  },
  {
    id: 'POPPINS',
    label: 'Poppins',
    googleName: 'Poppins:wght@400;600;700',
    cssFamily: "'Poppins', system-ui, sans-serif",
  },
  {
    id: 'MERRIWEATHER',
    label: 'Merriweather',
    googleName: 'Merriweather:wght@400;700',
    cssFamily: "'Merriweather', Georgia, serif",
  },
]

export const BRANDING_MODES: BrandingMode[] = ['TEXT', 'LOGO', 'TEXT_AND_LOGO']

export const getBrandFont = (fontId?: string): BrandFont =>
  BRAND_FONTS.find((font) => font.id === fontId) ?? BRAND_FONTS[0]

export const loadBrandFont = (fontId?: string) => {
  const font = getBrandFont(fontId)
  const linkId = 'brand-font-link'
  let link = document.getElementById(linkId) as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  link.href = `https://fonts.googleapis.com/css2?family=${font.googleName}&display=swap`
  document.documentElement.style.setProperty('--font-brand', font.cssFamily)
}
