import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppearance } from '../context/ThemeContext'
import { toImageSrc } from '../api/productImageService'

const HeroBanner = () => {
  const appearance = useAppearance()
  const [currentIndex, setCurrentIndex] = useState(0)
  const images = appearance.heroImages || []

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  if (images.length === 0 && !appearance.heroTitle) return null

  return (
    <section className="relative w-full h-96 md:h-[500px] overflow-hidden" style={{ backgroundColor: 'var(--color-accent)' }}>
      {images.length > 0 && (
        <div className="absolute inset-0">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={toImageSrc(img)}
              alt={`Hero ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full">
          <div className="space-y-6">
            {appearance.heroTitle && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                {appearance.heroTitle}
              </h1>
            )}
            {appearance.heroSubtitle && (
              <p className="text-lg md:text-xl text-white/90">
                {appearance.heroSubtitle}
              </p>
            )}
            <Link
              to="/shop"
              className="inline-block mt-6 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
