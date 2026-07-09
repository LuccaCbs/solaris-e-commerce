import { Link } from 'react-router-dom'
import { FeaturedProduct } from '../../api/featuredProductService'
import ProductImageSlider from '../ProductImageSlider'

type CompactProductCardProps = {
  item: FeaturedProduct
}

const CompactProductCard = ({ item }: CompactProductCardProps) => {
  return (
    <Link to="/catalog" className="block h-full">
      <article className="bg-white rounded-md shadow-sm hover:shadow-md transition h-full flex gap-3 p-3 border border-gray-100">
        <ProductImageSlider
          images={item.images}
          alt={item.productName}
          className="w-24 h-24 flex-shrink-0 rounded"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</h3>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            $ {item.price.toLocaleString('es-AR')}
          </p>
        </div>
      </article>
    </Link>
  )
}

export default CompactProductCard
