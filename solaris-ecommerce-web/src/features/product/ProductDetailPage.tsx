import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronLeft, ChevronRight, Home, Minus, Plus, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import AppHeader from '../../components/AppHeader'
import ProductImageGallery from '../../components/ProductImageGallery'
import ProductCustomForm from '../../components/ProductCustomForm'
import SimilarProductCard from '../../components/SimilarProductCard'
import { productService } from '../../api/productService'
import { productImageService } from '../../api/productImageService'
import { productFormService } from '../../api/productFormService'
import { cartService, CartItemDetail } from '../../api/cartService'
import { ProductForm } from '../../types/productForm'
import { getStoredUser } from '../../utils/auth'

const SIMILAR_VISIBLE = 5

const buildInitialValues = (form?: ProductForm | null) => {
  const values: Record<string, string> = {}
  form?.fields.forEach((field) => {
    values[field.fieldKey] = field.fieldType === 'CHECKBOX' ? '' : ''
  })
  return values
}

const ProductDetailPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = getStoredUser()
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const [quantity, setQuantity] = useState(1)
  const [similarStart, setSimilarStart] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setQuantity(1)
    setSimilarStart(0)
    setFormValues({})
    setFormErrors({})
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

  const { data: productForm } = useQuery({
    queryKey: ['product-form', productId],
    queryFn: async () => {
      try {
        return await productFormService.getByProduct(productId)
      } catch {
        return null
      }
    },
    enabled: Boolean(product?.madeToOrder),
  })

  useEffect(() => {
    if (productForm) {
      setFormValues(buildInitialValues(productForm))
      setFormErrors({})
    }
  }, [productForm])

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

  const addToCartMutation = useMutation({
    mutationFn: (details?: CartItemDetail[]) => {
      const cartIdentifier = localStorage.getItem('cartIdentifier')
      return cartService.addItemToCart(
        user?.id,
        cartIdentifier || undefined,
        productId,
        quantity,
        details
      )
    },
    onSuccess: (data) => {
      if (data.cartIdentifier) {
        localStorage.setItem('cartIdentifier', data.cartIdentifier)
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success(t('productDetail.addedToCart'))
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('productDetail.addToCartError')
      toast.error(message)
    },
  })

  const isMadeToOrder = Boolean(product?.madeToOrder)
  const formReady = !isMadeToOrder || (productForm && productForm.active && productForm.fields.length > 0)

  const maxQuantity = product?.stockQuantity ?? 0
  const hasCarousel = similarProducts.length > SIMILAR_VISIBLE
  const visibleSimilar = hasCarousel
    ? Array.from({ length: SIMILAR_VISIBLE }, (_, i) => {
        const index = (similarStart + i) % similarProducts.length
        return similarProducts[index]
      })
    : similarProducts

  const sortedFormFields = useMemo(
    () => (productForm?.fields || []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    [productForm]
  )

  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1))
  const increaseQuantity = () => setQuantity((q) => Math.min(maxQuantity, q + 1))

  const handleFormChange = (fieldKey: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }))
    setFormErrors((prev) => {
      const next = { ...prev }
      delete next[fieldKey]
      return next
    })
  }

  const validateCustomForm = () => {
    if (!isMadeToOrder || !productForm) return true

    const errors: Record<string, string> = {}
    sortedFormFields.forEach((field) => {
      const value = formValues[field.fieldKey]
      if (field.required && (!value || !value.trim())) {
        errors[field.fieldKey] = t('productDetail.fieldRequired')
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildCartDetails = (): CartItemDetail[] | undefined => {
    if (!isMadeToOrder || !productForm) return undefined

    return sortedFormFields
      .map((field) => ({
        productFormFieldId: field.id,
        fieldKey: field.fieldKey,
        fieldLabel: field.label,
        fieldValue: formValues[field.fieldKey] ?? '',
      }))
      .filter((detail) => detail.fieldValue.trim().length > 0)
  }

  const handleAddToCart = () => {
    if (!product || product.stockQuantity <= 0) return
    if (!validateCustomForm()) return
    addToCartMutation.mutate(buildCartDetails())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AppHeader showSearch={false} />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-600">{t('common.loading')}</div>
      </div>
    )
  }

  if (isError || !product) {
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
              <div className="flex items-center gap-2 mb-2">
                {product.categoryName && (
                  <p className="text-sm text-gray-500">{product.categoryName}</p>
                )}
                {isMadeToOrder && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                    {t('productDetail.madeToOrder')}
                  </span>
                )}
              </div>
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

              {isMadeToOrder && (
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mt-4 mb-1">
                    {t('productDetail.customization')}
                  </h2>
                  {!formReady ? (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      {t('productDetail.formNotConfigured')}
                    </p>
                  ) : (
                    <ProductCustomForm
                      fields={sortedFormFields}
                      values={formValues}
                      errors={formErrors}
                      onChange={handleFormChange}
                    />
                  )}
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
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending || product.stockQuantity <= 0 || !formReady}
                  className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-md font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addToCartMutation.isPending ? t('productDetail.adding') : t('productDetail.addToCart')}
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
