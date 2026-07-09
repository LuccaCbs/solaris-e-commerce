import { FeaturedProduct, CardType } from '../api/featuredProductService'

export const CARD_SECTIONS: { type: CardType; titleKey: string; gridClass: string; previewClass: string }[] = [
  {
    type: 'BASIC',
    titleKey: 'home.sectionBasic',
    gridClass: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4',
    previewClass: 'max-w-xs',
  },
  {
    type: 'COMPACT',
    titleKey: 'home.sectionCompact',
    gridClass: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    previewClass: 'max-w-sm',
  },
  {
    type: 'MENU',
    titleKey: 'home.sectionMenu',
    gridClass: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    previewClass: 'max-w-2xl',
  },
]

export const filterFeaturedProducts = (
  items: FeaturedProduct[],
  filters: {
    searchTerm: string
    selectedCategory: number | null
    priceMin: string
    priceMax: string
    categoryNames: Map<number, string>
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
      !selectedCategoryName || item.categoryName === selectedCategoryName
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
