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
      className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition flex-shrink-0 w-[220px]"
    >
      <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
        {activeImage ? (
          <img
            src={toImageSrc(activeImage.imageData)}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg text-gray-300">📦</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-800 line-clamp-2 leading-snug mb-1">{name}</p>
        <p className="text-sm font-semibold text-gray-900">
          $ {price.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
        </p>
      </div>
    </Link>
  )
}

export default SimilarProductCard
