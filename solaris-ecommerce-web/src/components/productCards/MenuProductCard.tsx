import { Link } from 'react-router-dom'
import { FeaturedProduct } from '../../api/featuredProductService'
import ProductImageSlider from '../ProductImageSlider'

type MenuProductCardProps = {
  item: FeaturedProduct
}

const MenuProductCard = ({ item }: MenuProductCardProps) => {
  return (
    <Link to="/catalog" className="block h-full">
      <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition h-full flex border border-gray-100 overflow-hidden">
        <ProductImageSlider
          images={item.images}
          alt={item.productName}
          className="w-28 h-28 flex-shrink-0"
        />
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{item.productName}</h3>
            {item.productDescription && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">{item.productDescription}</p>
            )}
          </div>
          <p className="text-lg font-bold text-amber-700 mt-2">
            $ {item.price.toLocaleString('es-AR')}
          </p>
        </div>
      </article>
    </Link>
  )
}

export default MenuProductCard
