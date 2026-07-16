import { Link } from 'react-router-dom'
import { ProductImage, toImageSrc } from '../api/productImageService'

type SimilarProductCardProps = {
  id: number
  name: string
  price: number
  images: ProductImage[]
}

const SimilarProductCard = ({ id, name, price, images }: SimilarProductCardProps) => {
  const activeImage = images.find((img) => img.active !== false)

  return (
    <Link
      to={`/products/${id}`}
      className="block bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-square bg-gray-50">
        {activeImage ? (
          <img
            src={toImageSrc(activeImage.imageData)}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-800 line-clamp-2 leading-snug mb-1">{name}</p>
        <p className="text-base font-semibold text-gray-900">
          $ {price.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
        </p>
      </div>
    </Link>
  )
}

export default SimilarProductCard
