import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FeaturedProduct } from '../../api/featuredProductService'
import ProductImageSlider from '../ProductImageSlider'
import { ShoppingCart } from 'lucide-react'

type MenuProductCardProps = {
  item: FeaturedProduct
  large?: boolean
}

const MenuProductCard = ({ item, large = false }: MenuProductCardProps) => {
  const { t } = useTranslation()

  return (
    <Link
      to={`/products/${item.productId}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition h-full flex border border-gray-100 overflow-hidden"
    >
      <ProductImageSlider
        images={item.images}
        alt={item.productName}
        className={large ? 'w-40 h-40 md:w-48 md:h-48 flex-shrink-0' : 'w-28 h-28 flex-shrink-0'}
      />
      <div className={`flex-1 flex flex-col justify-between ${large ? 'p-4 md:p-5' : 'p-3'}`}>
        <div>
          <h3 className={`font-semibold text-gray-900 ${large ? 'text-lg md:text-xl' : 'text-base'}`}>
            {item.productName}
          </h3>
          {item.productDescription && (
            <p className={`text-gray-600 mt-1 line-clamp-3 ${large ? 'text-sm md:text-base' : 'text-sm'}`}>
              {item.productDescription}
            </p>
          )}
        </div>
        <div>
          <p className={`font-bold text-amber-700 mt-2 ${large ? 'text-xl md:text-2xl' : 'text-lg'}`}>
            $ {item.price.toLocaleString('es-AR')}
          </p>
          <div
            className={`mt-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 ${large ? 'text-sm font-medium' : 'text-xs font-medium'}`}
          >
            <ShoppingCart className={large ? 'w-4 h-4' : 'w-3 h-3'} />
            {t('catalog.addToCart')}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MenuProductCard
