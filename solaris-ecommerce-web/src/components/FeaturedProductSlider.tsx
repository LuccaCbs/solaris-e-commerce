import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { featuredProductService, FeaturedProduct } from '../api/featuredProductService'
import ProductSliderCard from './productCards/ProductSliderCard'
import ProductDetailModal from './ProductDetailModal'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const VISIBLE_COUNT = 5

const FeaturedProductSlider = () => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null)

  const { data: storefront, isLoading } = useQuery({
    queryKey: ['public-storefront'],
    queryFn: featuredProductService.getPublic,
  })

  const featured = storefront?.products || []
  const hasCarousel = featured.length > VISIBLE_COUNT
  const maxIndex = Math.max(0, featured.length - VISIBLE_COUNT)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex))
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="flex gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (featured.length === 0) {
    return null
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('catalog.featuredProducts')}</h2>

        <div className="relative">
          {hasCarousel && (
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                width: `${(featured.length / VISIBLE_COUNT) * 100}%`,
                transform: `translateX(-${(currentIndex / featured.length) * 100}%)`,
              }}
            >
              {featured.map((item) => (
                <div
                  key={item.id}
                  className="px-3"
                  style={{ width: `${100 / featured.length}%` }}
                >
                  <ProductSliderCard item={item} onSelect={setSelectedProduct} />
                </div>
              ))}
            </div>
          </div>

          {hasCarousel && (
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Siguiente"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {hasCarousel && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Ir al producto ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-gray-900 w-6' : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  )
}

export default FeaturedProductSlider
