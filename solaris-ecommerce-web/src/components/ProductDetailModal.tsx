import { X, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ProductImageSlider from './ProductImageSlider'
import { FeaturedProduct } from '../api/featuredProductService'
import { useAddToCart } from '../hooks/useAddToCart'

type ProductDetailModalProps = {
  product: FeaturedProduct
  onClose: () => void
}

const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const { t } = useTranslation()
  const { addToCart, isAdding } = useAddToCart(product)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">{product.productName}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ProductImageSlider
            images={product.images}
            alt={product.productName}
            className="aspect-video w-full rounded-lg"
            showControlsAlways
          />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">{t('admin.product.price')}:</span>{' '}
              <strong>$ {product.price.toLocaleString('es-AR')}</strong>
            </div>
            <div>
              <span className="text-gray-500">{t('admin.product.stock')}:</span>{' '}
              <strong>{product.stockQuantity}</strong>
            </div>
            {product.categoryName && (
              <div>
                <span className="text-gray-500">{t('admin.product.category')}:</span>{' '}
                <strong>{product.categoryName}</strong>
              </div>
            )}
            <div>
              <span className="text-gray-500">{t('admin.product.status')}:</span>{' '}
              <strong>
                {product.stockQuantity > 0 ? t('home.available') : t('home.outOfStock')}
              </strong>
            </div>
          </div>
          {product.productDescription && (
            <div className="text-sm">
              <span className="text-gray-500">{t('admin.product.description')}:</span>
              <p className="mt-1 text-gray-800">{product.productDescription}</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={addToCart}
              disabled={isAdding || product.stockQuantity <= 0}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              {isAdding ? t('productDetail.adding') : t('catalog.addToCart')}
            </button>
            <button onClick={onClose} className="w-full py-2 border rounded-lg hover:bg-gray-50">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
