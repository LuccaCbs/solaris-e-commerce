import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FeaturedProduct } from '../api/featuredProductService'
import StorefrontProductCard from './StorefrontProductCard'

type FullWidthProductSliderProps = {
  products: FeaturedProduct[]
}

const FullWidthProductSlider = ({ products }: FullWidthProductSliderProps) => {
  const [startIndex, setStartIndex] = useState(0)
  const VISIBLE_COUNT = 5

  if (!products?.length) return null

  const hasCarousel = products.length > VISIBLE_COUNT
  const visibleProducts = hasCarousel
    ? [...products.slice(startIndex), ...products.slice(0, startIndex)].slice(0, VISIBLE_COUNT)
    : products

  const goPrev = () => {
    setStartIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const goNext = () => {
    setStartIndex((prev) => (prev + 1) % products.length)
  }

  return (
    <section className="w-full py-8 md:py-12" style={{ backgroundColor: 'var(--color-accent)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          {hasCarousel && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 transition hidden md:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {visibleProducts.map((item, index) => (
              <div key={`${item.id}-${startIndex}-${index}`} className="min-w-0">
                <StorefrontProductCard item={item} />
              </div>
            ))}
          </div>

          {hasCarousel && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Siguiente"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 transition hidden md:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {hasCarousel && (
          <div className="flex justify-center gap-2 mt-6">
            {products.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setStartIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === startIndex ? 'bg-gray-900' : 'bg-gray-300'
                }`}
                aria-label={`Ir al producto ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FullWidthProductSlider
