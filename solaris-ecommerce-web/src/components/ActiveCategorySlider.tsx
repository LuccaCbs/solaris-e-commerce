import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toImageSrc } from '../api/productImageService'
import { Category } from '../types/category'

type ActiveCategorySliderProps = {
  categories: Category[]
}

const VISIBLE_COUNT = 3

const ActiveCategorySlider = ({ categories }: ActiveCategorySliderProps) => {
  const [startIndex, setStartIndex] = useState(0)

  const activeCategories = categories.filter((category) => category.active !== false)
  if (!activeCategories.length) return null

  const hasCarousel = activeCategories.length > VISIBLE_COUNT
  const visibleCategories = hasCarousel
    ? Array.from({ length: VISIBLE_COUNT }, (_, index) => (
        activeCategories[(startIndex + index) % activeCategories.length]
      ))
    : activeCategories

  const goPrev = () => {
    setStartIndex((prev) => (prev - 1 + activeCategories.length) % activeCategories.length)
  }

  const goNext = () => {
    setStartIndex((prev) => (prev + 1) % activeCategories.length)
  }

  return (
    <section className="w-full py-8 md:py-12" style={{ backgroundColor: 'var(--color-accent)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative min-h-[420px] md:min-h-[520px] flex items-center">
          {hasCarousel && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className={`grid w-full grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 ${hasCarousel ? 'px-10' : ''}`}>
            {visibleCategories.map((category, index) => (
              <Link
                key={`${category.id}-${startIndex}-${index}`}
                to={`/?categoryId=${category.id}`}
                className="group relative min-h-[360px] md:min-h-[460px] overflow-hidden rounded-xl bg-white shadow-md border border-white/60"
              >
                {category.imageData ? (
                  <img
                    src={toImageSrc(category.imageData)}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">{category.name}</h2>
                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-white/90">{category.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {hasCarousel && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Siguiente"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 border border-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-50 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {hasCarousel && (
          <div className="flex justify-center gap-2 mt-6">
            {activeCategories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setStartIndex(index)}
                className={`h-2 rounded-full transition ${index === startIndex ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'}`}
                aria-label={`Ir a ${category.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ActiveCategorySlider
