import { FeaturedProduct, CardType } from '../api/featuredProductService'

export type DisplayMode = 'INDIVIDUAL' | 'BY_CATEGORY'

export const FEATURED_DISPLAY_MODE_KEY = 'featured.display_mode'

/** Grid uniforme de 3 columnas para admin y vitrina individual */
export const UNIFORM_GRID_CLASS = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'

export const CARD_SECTIONS: { type: CardType; titleKey: string }[] = [
  { type: 'BASIC', titleKey: 'home.sectionBasic' },
  { type: 'COMPACT', titleKey: 'home.sectionCompact' },
  { type: 'MENU', titleKey: 'home.sectionMenu' },
]

export const filterFeaturedProducts = (
  items: FeaturedProduct[],
  filters: {
    searchTerm: string
    selectedCategory: number | null
    priceMin: string
    priceMax: string
    categoryNames: Map<number, string>
    selectedCategoryNames?: string[]
  }
) => {
  const min = filters.priceMin ? Number(filters.priceMin) : null
  const max = filters.priceMax ? Number(filters.priceMax) : null
  const search = filters.searchTerm.trim().toLowerCase()
  const selectedCategoryName = filters.selectedCategory
    ? filters.categoryNames.get(filters.selectedCategory)
    : null

  return items.filter((item) => {
    const matchesSearch =
      !search ||
      item.productName.toLowerCase().includes(search) ||
      item.productDescription?.toLowerCase().includes(search)
    const matchesCategory =
      !selectedCategoryName ||
      (filters.selectedCategoryNames && filters.selectedCategoryNames.length > 0
        ? filters.selectedCategoryNames.includes(item.categoryName || '')
        : item.categoryName === selectedCategoryName)
    const matchesMin = min === null || item.price >= min
    const matchesMax = max === null || item.price <= max
    return matchesSearch && matchesCategory && matchesMin && matchesMax
  })
}

export const groupByCardType = (items: FeaturedProduct[]) => ({
  BASIC: items.filter((item) => (item.cardType || 'BASIC') === 'BASIC'),
  COMPACT: items.filter((item) => item.cardType === 'COMPACT'),
  MENU: items.filter((item) => item.cardType === 'MENU'),
})

export const groupByCategory = (items: FeaturedProduct[]) => {
  const map = new Map<string, FeaturedProduct[]>()

  items.forEach((item) => {
    const category = item.categoryName || 'GENERAL'
    const list = map.get(category) || []
    list.push(item)
    map.set(category, list)
  })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([categoryName, products]) => ({ categoryName, products }))
}

export const getCarouselWindow = (items: FeaturedProduct[], startIndex: number, size = 3) => {
  if (items.length <= size) return items
  return Array.from({ length: size }, (_, i) => items[(startIndex + i) % items.length])
}
