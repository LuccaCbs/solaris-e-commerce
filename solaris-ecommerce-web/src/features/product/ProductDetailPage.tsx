import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronLeft, ChevronRight, Home, Minus, Plus, ShoppingCart } from 'lucide-react'
import AppHeader from '../../components/AppHeader'
import ProductImageGallery from '../../components/ProductImageGallery'
import SimilarProductCard from '../../components/SimilarProductCard'
import { productService } from '../../api/productService'
import { productImageService } from '../../api/productImageService'
import { FeaturedProduct } from '../../api/featuredProductService'
import { useAddToCart } from '../../hooks/useAddToCart'

const SIMILAR_VISIBLE = 5

const ProductDetailPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const [quantity, setQuantity] = useState(1)
  const [similarStart, setSimilarStart] = useState(0)

  useEffect(() => {
    setQuantity(1)
    setSimilarStart(0)
  }, [productId])

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.getProductById(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })

  const { data: images = [] } = useQuery({
    queryKey: ['product-images', productId],
    queryFn: () => productImageService.getByProduct(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })

  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similar-products', product?.categoryId, productId],
    queryFn: async () => {
      if (!product?.categoryId) return []
      const products = await productService.getProductsByCategory(product.categoryId)
      const others = products.filter((p) => p.id !== productId && p.active !== false)
      const withImages = await Promise.all(
        others.map(async (p) => {
          const imgs = await productImageService.getByProduct(p.id)
          return { ...p, images: imgs }
        })
      )
      return withImages
    },
    enabled: Boolean(product?.categoryId),
  })

  const featuredLike: FeaturedProduct | null = product
    ? {
        id: product.id,
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        categoryName: product.categoryName,
        cardType: 'BASIC',
        displayOrder: 0,
        active: product.active !== false,
        images,
      }
    : null

  const { addToCart, isAdding } = useAddToCart(
    featuredLike ?? {
      id: 0,
      productId: 0,
      productName: '',
      price: 0,
      stockQuantity: 0,
      cardType: 'BASIC',
      displayOrder: 0,
      active: false,
      images: [],
    }
  )

  const maxQuantity = product?.stockQuantity ?? 0
  const hasCarousel = similarProducts.length > SIMILAR_VISIBLE
  const visibleSimilar = hasCarousel
    ? Array.from({ length: SIMILAR_VISIBLE }, (_, i) => {
        const index = (similarStart + i) % similarProducts.length
        return similarProducts[index]
      })
    : similarProducts

  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1))
  const increaseQuantity = () => setQuantity((q) => Math.min(maxQuantity, q + 1))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AppHeader showSearch={false} />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  if (isError || !product || !featuredLike) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AppHeader showSearch={false} />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">{t('productDetail.notFound')}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader showSearch={false} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('productDetail.back')}
          </button>
          <span className="text-gray-300">|</span>
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 transition"
          >
            <Home className="w-4 h-4" />
            {t('productDetail.home')}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <ProductImageGallery images={images} alt={product.name} />
            </div>

            <div className="lg:col-span-4 flex flex-col">
              {product.categoryName && (
                <p className="text-sm text-gray-500 mb-2">{product.categoryName}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
                $ {product.price.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </p>
              {product.description && (
                <div className="border-t border-gray-100 pt-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">
                    {t('admin.product.description')}
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 sticky top-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('admin.product.stock')}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {product.stockQuantity > 0 ? (
                      <span className="text-green-700">{t('home.available')}</span>
                    ) : (
                      <span className="text-red-600">{t('home.outOfStock')}</span>
                    )}
                    {product.stockQuantity > 0 && (
                      <span className="text-gray-500 font-normal ml-1">
                        ({product.stockQuantity})
                      </span>
                    )}
                  </p>
                </div>

                {product.stockQuantity > 0 && (
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">{t('productDetail.quantity')}</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={quantity >= maxQuantity}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-medium opacity-50 cursor-not-allowed"
                >
                  {t('productDetail.buyNow')}
                </button>

                <button
                  type="button"
                  onClick={(e) => addToCart(e, quantity)}
                  disabled={isAdding || product.stockQuantity <= 0}
                  className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-md font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAdding ? t('productDetail.adding') : t('productDetail.addToCart')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('productDetail.similarProducts')}</h2>
            <div className="relative">
              {hasCarousel && (
                <button
                  type="button"
                  onClick={() =>
                    setSimilarStart((prev) => (prev - 1 + similarProducts.length) % similarProducts.length)
                  }
                  aria-label="Anterior"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div className={`flex gap-3 overflow-hidden ${hasCarousel ? 'px-6' : ''}`}>
                {visibleSimilar.map((item) => (
                  <SimilarProductCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    images={item.images}
                  />
                ))}
              </div>

              {hasCarousel && (
                <button
                  type="button"
                  onClick={() => setSimilarStart((prev) => (prev + 1) % similarProducts.length)}
                  aria-label="Siguiente"
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default ProductDetailPage
