import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AppHeader from '../../components/AppHeader'
import CatalogFilterSidebar, { CatalogFilters } from '../../components/CatalogFilterSidebar'
import CategoryProductCarousel from '../../components/CategoryProductCarousel'
import ProductDetailModal from '../../components/ProductDetailModal'
import StorefrontProductCard from '../../components/StorefrontProductCard'
import { featuredProductService, FeaturedProduct } from '../../api/featuredProductService'
import { categoryService } from '../../api/categoryService'
import { productService } from '../../api/productService'
import { productImageService } from '../../api/productImageService'
import {
  CARD_SECTIONS,
  filterFeaturedProducts,
  groupByCategory,
  UNIFORM_GRID_CLASS,
} from '../../utils/featuredProductLayout'

const ShopPage = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<CatalogFilters>({
    searchTerm: '',
    selectedCategory: null,
    priceMin: '',
    priceMax: '',
    selectedCategoryNames: [],
  })
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null)

  const categoryIdParam = searchParams.get('categoryId')
  const productIdParam = searchParams.get('productId')

  const { data: categories = [] } = useQuery({
    queryKey: ['category-filter-tree'],
    queryFn: categoryService.getFilterTree,
  })

  const { data: storefront, isLoading } = useQuery({
    queryKey: ['public-storefront'],
    queryFn: featuredProductService.getPublic,
  })

  const featured = storefront?.products || []
  const displayMode = storefront?.displayMode || 'INDIVIDUAL'

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      selectedCategory: categoryIdParam ? Number(categoryIdParam) : null,
      selectedCategoryNames: [],
    }))
  }, [categoryIdParam])

  useEffect(() => {
    if (!productIdParam || !featured.length) return
    const product = featured.find((item) => item.productId === Number(productIdParam))
    if (product) setSelectedProduct(product)
  }, [productIdParam, featured])

  useQuery({
    queryKey: ['shop-product-detail', productIdParam],
    queryFn: async () => {
      const productId = Number(productIdParam)
      const product = await productService.getProductById(productId)
      const images = await productImageService.getByProduct(productId)
      const featuredLike: FeaturedProduct = {
        id: product.id,
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        categoryName: product.categoryName,
        cardType: 'BASIC',
        displayOrder: 0,
        active: product.active !== false,
        images,
      }
      setSelectedProduct(featuredLike)
      return featuredLike
    },
    enabled: Boolean(productIdParam) && !featured.some((item) => item.productId === Number(productIdParam)),
  })

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  )

  const getCategorySubcategoryIds = (categoryId: number | null): number[] => {
    if (categoryId === null) return []
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return [categoryId]
    if (category.subcategories && category.subcategories.length > 0) {
      return [categoryId, ...category.subcategories.map((sub) => sub.id)]
    }
    return [categoryId]
  }

  const selectedCategoryIds = getCategorySubcategoryIds(filters.selectedCategory)
  const selectedCategoryNames = selectedCategoryIds.map((id) => categoryNames.get(id)).filter(Boolean) as string[]

  const filteredFeatured = filterFeaturedProducts(featured, {
    ...filters,
    selectedCategory: filters.selectedCategory,
    selectedCategoryNames,
    categoryNames,
  })
  const groupedByCardType = useMemo(() => {
    const groups: Record<string, FeaturedProduct[]> = { BASIC: [], COMPACT: [], MENU: [] }
    filteredFeatured.forEach((item) => groups[item.cardType || 'BASIC'].push(item))
    return groups
  }, [filteredFeatured])
  const groupedByCategory = useMemo(() => groupByCategory(filteredFeatured), [filteredFeatured])

  const handleFilterChange = (next: CatalogFilters) => {
    setFilters(next)
    if (next.selectedCategory) {
      setSearchParams({ categoryId: String(next.selectedCategory) }, { replace: true })
    } else if (categoryIdParam) {
      const params = new URLSearchParams(searchParams)
      params.delete('categoryId')
      setSearchParams(params, { replace: true })
    }
  }

  const closeProductModal = () => {
    setSelectedProduct(null)
    if (productIdParam) {
      const next = new URLSearchParams(searchParams)
      next.delete('productId')
      setSearchParams(next, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader showSearch={false} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <CatalogFilterSidebar filters={filters} categories={categories} onChange={handleFilterChange} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('shop.title')}</h1>
            {isLoading ? (
              <div className="text-center py-12">{t('catalog.loadingProducts')}</div>
            ) : filteredFeatured.length === 0 ? (
              <div className="text-center py-12 text-gray-600">{t('catalog.noProducts')}</div>
            ) : displayMode === 'BY_CATEGORY' ? (
              <div className="space-y-8">
                {groupedByCategory.map(({ categoryName, products }) => (
                  <CategoryProductCarousel key={categoryName} categoryName={categoryName} products={products} onSelect={setSelectedProduct} />
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {CARD_SECTIONS.map((section) => {
                  const items = groupedByCardType[section.type]
                  if (!items?.length) return null
                  return (
                    <section key={section.type}>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t(section.titleKey)}</h2>
                      <div className={UNIFORM_GRID_CLASS}>
                        {items.map((item) => (
                          <StorefrontProductCard key={item.id} item={item} onSelect={setSelectedProduct} largeMenu={item.cardType === 'MENU'} />
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
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={closeProductModal} />}
    </div>
  )
}

export default ShopPage
