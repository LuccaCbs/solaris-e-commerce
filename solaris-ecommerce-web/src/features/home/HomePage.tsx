import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AppHeader from '../../components/AppHeader'
import StorefrontProductCard from '../../components/StorefrontProductCard'
import { featuredProductService } from '../../api/featuredProductService'
import { categoryService } from '../../api/categoryService'

const HomePage = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const { data: featured, isLoading } = useQuery({
    queryKey: ['public-featured'],
    queryFn: featuredProductService.getPublic,
  })

  const filteredFeatured = (featured || []).filter((item) => {
    const matchesSearch = !searchTerm ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory ||
      categories?.find((c) => c.id === selectedCategory)?.name === item.categoryName
    return matchesSearch && matchesCategory
  })

  const activeCategories = categories?.filter((c) => c.active !== false) || []

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {t('home.all')}
            </button>
            {activeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">{t('catalog.loadingProducts')}</div>
        ) : filteredFeatured.length === 0 ? (
          <div className="text-center py-12 text-gray-600">{t('catalog.noProducts')}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredFeatured.map((item) => (
              <StorefrontProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
