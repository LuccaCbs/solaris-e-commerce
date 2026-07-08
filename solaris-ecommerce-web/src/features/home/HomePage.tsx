import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { productService } from '../../api/productService'
import { categoryService } from '../../api/categoryService'
import { Product } from '../../types/product'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAllCategories,
  })

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory],
    queryFn: () => productService.filterProducts({
      search: searchTerm || undefined,
      categoryId: selectedCategory || undefined,
    }),
  })

  const filteredProducts = products?.content || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-yellow-400 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">Solaris</span>
            </Link>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos, marcas y más..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded">
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/catalog" className="text-gray-700 hover:text-gray-900 font-medium">
                Categorías
              </Link>
              <Link to="/catalog" className="text-gray-700 hover:text-gray-900 font-medium">
                Ofertas
              </Link>
              <Link to="/catalog" className="text-gray-700 hover:text-gray-900 font-medium">
                Historial
              </Link>
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-gray-900">
                <ShoppingCart className="w-6 h-6" />
              </Link>
              <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                <User className="w-6 h-6" />
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 p-1 rounded">
                <Search className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-300 pt-4">
              <div className="flex flex-col gap-3">
                <Link to="/catalog" className="text-gray-700 hover:text-gray-900 font-medium">
                  Categorías
                </Link>
                <Link to="/catalog" className="text-gray-700 hover:text-gray-900 font-medium">
                  Ofertas
                </Link>
                <Link to="/catalog" className="text-gray-700 hover:text-gray-900 font-medium">
                  Historial
                </Link>
                <Link to="/cart" className="text-gray-700 hover:text-gray-900 font-medium">
                  Carrito
                </Link>
                <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
                  Iniciar Sesión
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Category bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todo
            </button>
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link to={`/catalog`} className="block">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer">
        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center p-4">
          <div className="text-gray-400 text-5xl">📦</div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.stockQuantity > 0 ? (
              <span className="text-xs text-green-600">
                {product.stockQuantity} disponibles
              </span>
            ) : (
              <span className="text-xs text-red-600">Agotado</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default HomePage
