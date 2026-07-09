import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductImage, toImageSrc } from '../api/productImageService'

type ProductImageSliderProps = {
  images?: ProductImage[]
  alt: string
  className?: string
  showControlsAlways?: boolean
}

const ProductImageSlider = ({ images = [], alt, className = '', showControlsAlways = false }: ProductImageSliderProps) => {
  const [index, setIndex] = useState(0)
  const activeImages = images.filter((img) => img.active !== false)

  if (activeImages.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-4xl text-gray-300">📦</span>
      </div>
    )
  }

  const current = activeImages[index]

  return (
    <div className={`relative bg-white overflow-hidden group ${className}`}>
      <img
        src={toImageSrc(current.imageData)}
        alt={alt}
        className="w-full h-full object-contain"
      />
      {activeImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIndex((prev) => (prev === 0 ? activeImages.length - 1 : prev - 1))
            }}
            className={`absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow ${showControlsAlways ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIndex((prev) => (prev === activeImages.length - 1 ? 0 : prev + 1))
            }}
            className={`absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1 shadow ${showControlsAlways ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {activeImages.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ProductImageSlider
