import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StorefrontProductCard from './StorefrontProductCard'
import { FeaturedProduct } from '../api/featuredProductService'
import { getCarouselWindow } from '../utils/featuredProductLayout'

type CategoryProductCarouselProps = {
  categoryName: string
  products: FeaturedProduct[]
  onSelect?: (item: FeaturedProduct) => void
}

const VISIBLE_COUNT = 3

const CategoryProductCarousel = ({ categoryName, products, onSelect }: CategoryProductCarouselProps) => {
  const [startIndex, setStartIndex] = useState(0)
  const hasCarousel = products.length > VISIBLE_COUNT
  const visibleProducts = getCarouselWindow(products, startIndex, VISIBLE_COUNT)

  const goPrev = () => {
    setStartIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const goNext = () => {
    setStartIndex((prev) => (prev + 1) % products.length)
  }

  const gridCols =
    products.length === 1 ? 'grid-cols-1' : products.length === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{categoryName}</h2>

      <div className="relative">
        {hasCarousel && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 border border-gray-200 rounded-full p-2 shadow hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className={`grid ${gridCols} gap-4 ${hasCarousel ? 'px-10' : ''}`}>
          {visibleProducts.map((item, index) => (
            <div key={`${item.id}-${startIndex}-${index}`} className="min-w-0 h-full">
              <StorefrontProductCard
                item={item}
                onSelect={onSelect}
                largeMenu={item.cardType === 'MENU'}
              />
            </div>
          ))}
        </div>

        {hasCarousel && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 border border-gray-200 rounded-full p-2 shadow hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {hasCarousel && (
        <div className="flex justify-center gap-1.5 mt-4">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setStartIndex(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === startIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Ir al producto ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default CategoryProductCarousel
