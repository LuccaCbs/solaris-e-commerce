import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { featuredProductService } from '../api/featuredProductService'
import StorefrontProductCard from './StorefrontProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const FeaturedProductSlider = () => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)

  const { data: storefront, isLoading } = useQuery({
    queryKey: ['public-storefront'],
    queryFn: featuredProductService.getPublic,
  })

  const featured = storefront?.products || []

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) setItemsPerPage(1)
      else if (window.innerWidth < 1024) setItemsPerPage(2)
      else setItemsPerPage(3)
    }
    updateItemsPerPage()
    window.addEventListener('resize', updateItemsPerPage)
    return () => window.removeEventListener('resize', updateItemsPerPage)
  }, [])

  const totalPages = Math.ceil(featured.length / itemsPerPage)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (featured.length === 0) {
    return null
  }

  const visibleProducts = featured.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('catalog.featuredProducts')}</h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={totalPages <= 1}
            className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={totalPages <= 1}
            className="p-2 rounded-full bg-white shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out"
          style={{
            transform: 'translateX(0)',
          }}
        >
          {visibleProducts.map((item) => (
            <StorefrontProductCard key={item.id} item={item} onSelect={() => {}} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-gray-900 w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FeaturedProductSlider
