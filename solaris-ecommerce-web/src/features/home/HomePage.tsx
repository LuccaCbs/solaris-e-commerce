import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AppHeader from '../../components/AppHeader'
import CatalogFilterSidebar, { CatalogFilters } from '../../components/CatalogFilterSidebar'
import ProductDetailModal from '../../components/ProductDetailModal'
import StorefrontProductCard from '../../components/StorefrontProductCard'
import { featuredProductService, FeaturedProduct } from '../../api/featuredProductService'
import { categoryService } from '../../api/categoryService'
import { CARD_SECTIONS, filterFeaturedProducts } from '../../utils/featuredProductLayout'

const HomePage = () => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<CatalogFilters>({
    searchTerm: '',
    selectedCategory: null,
    priceMin: '',
    priceMax: '',
  })
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ['public-featured'],
    queryFn: featuredProductService.getPublic,
  })

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  )

  const filteredFeatured = filterFeaturedProducts(featured, {
    ...filters,
    categoryNames,
  })

  const grouped = useMemo(() => {
    const groups: Record<string, FeaturedProduct[]> = { BASIC: [], COMPACT: [], MENU: [] }
    filteredFeatured.forEach((item) => {
      const type = item.cardType || 'BASIC'
      groups[type].push(item)
    })
    return groups
  }, [filteredFeatured])

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader showSearch={false} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          <CatalogFilterSidebar
            filters={filters}
            categories={categories}
            onChange={setFilters}
          />

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="text-center py-12">{t('catalog.loadingProducts')}</div>
            ) : filteredFeatured.length === 0 ? (
              <div className="text-center py-12 text-gray-600">{t('catalog.noProducts')}</div>
            ) : (
              <div className="space-y-10">
                {CARD_SECTIONS.map((section) => {
                  const items = grouped[section.type]
                  if (!items?.length) return null

                  return (
                    <section key={section.type}>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t(section.titleKey)}
                      </h2>
                      <div className={section.gridClass}>
                        {items.map((item) => (
                          <StorefrontProductCard
                            key={item.id}
                            item={item}
                            onSelect={setSelectedProduct}
                            largeMenu={section.type === 'MENU'}
                          />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default HomePage
