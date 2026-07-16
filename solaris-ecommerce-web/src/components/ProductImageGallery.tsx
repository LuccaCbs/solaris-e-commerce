import { useState } from 'react'
import { ProductImage, toImageSrc } from '../api/productImageService'

type ProductImageGalleryProps = {
  images?: ProductImage[]
  alt: string
}

const ProductImageGallery = ({ images = [], alt }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const activeImages = images.filter((img) => img.active !== false)

  if (activeImages.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center aspect-square w-full">
        <span className="text-6xl text-gray-300">📦</span>
      </div>
    )
  }

  const current = activeImages[selectedIndex]

  return (
    <div className="flex gap-3">
      {activeImages.length > 1 && (
        <div className="flex flex-col gap-2 flex-shrink-0">
          {activeImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`w-14 h-14 rounded border-2 overflow-hidden transition ${
                i === selectedIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={toImageSrc(img.imageData)}
                alt={`${alt} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg border border-gray-100 overflow-hidden aspect-square">
        <img
          src={toImageSrc(current.imageData)}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}

export default ProductImageGallery
