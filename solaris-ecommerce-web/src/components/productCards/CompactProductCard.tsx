import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FeaturedProduct } from '../../api/featuredProductService'
import ProductImageSlider from '../ProductImageSlider'
import { ShoppingCart } from 'lucide-react'

type CompactProductCardProps = {
  item: FeaturedProduct
}

const CompactProductCard = ({ item }: CompactProductCardProps) => {
  const { t } = useTranslation()

  return (
    <Link
      to={`/products/${item.productId}`}
      className="bg-white rounded-md shadow-sm hover:shadow-md transition h-full flex gap-3 p-3 border border-gray-100"
    >
      <ProductImageSlider
        images={item.images}
        alt={item.productName}
        className="w-24 h-24 flex-shrink-0 rounded"
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</h3>
        <p className="text-lg font-semibold text-gray-900 mt-1">
          $ {item.price.toLocaleString('es-AR')}
        </p>
        <div className="mt-auto bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 text-xs font-medium">
          <ShoppingCart className="w-3 h-3" />
          {t('catalog.addToCart')}
        </div>
      </div>
    </Link>
  )
}

export default CompactProductCard
