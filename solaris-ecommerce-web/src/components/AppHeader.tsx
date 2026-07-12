import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import LanguageSelector from './LanguageSelector'
import { getStoredUser, isAdminUser, logout } from '../utils/auth'
import { categoryService } from '../api/categoryService'
import { toImageSrc } from '../api/productImageService'
import { Category } from '../types/category'

type AppHeaderProps = {
  searchTerm?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

const getMenuImages = (menu: Category) => {
  const images: { id: number; src: string; name: string }[] = []
  if (menu.imageData) {
    images.push({ id: menu.id, src: menu.imageData, name: menu.name })
  }
  menu.subcategories?.forEach((sub) => {
    if (sub.imageData && images.length < 2) {
      images.push({ id: sub.id, src: sub.imageData, name: sub.name })
    }
  })
  return images.slice(0, 2)
}

const getItemLabel = (item: Category) => item.productName || item.name

const getItemLink = (item: Category) =>
  item.productId ? `/catalog?productId=${item.productId}` : `/catalog?categoryId=${item.id}`

const AppHeader = ({ searchTerm = '', onSearchChange, showSearch = true }: AppHeaderProps) => {
  const { t } = useTranslation()
  const user = getStoredUser()
  const admin = isAdminUser(user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['category-tree'],
    queryFn: categoryService.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  })

  const navMenus = categoryTree.filter(
    (cat) => cat.categoryType === 'MENU' && !cat.systemCategory
  )
  const hoveredMenu = navMenus.find((menu) => menu.id === hoveredCategory)
  const menuImages = hoveredMenu ? getMenuImages(hoveredMenu) : []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setHoveredCategory(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header ref={headerRef} className="relative shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>{t('home.title')}</span>
          </Link>

          {showSearch && onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={t('common.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 bg-white"
                  style={{ borderColor: 'var(--color-secondary)' }}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 p-1 rounded">
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          <nav className="hidden md:flex items-center gap-4">
            {navMenus.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.id)}
              >
                <button className="flex items-center gap-1 font-medium text-sm transition hover:opacity-80" style={{ color: 'var(--color-secondary)' }}>
                  {category.name}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
            {admin && (
              <Link to="/admin" className="font-medium text-sm transition hover:opacity-80 border-l pl-4" style={{ color: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}>
                {t('nav.admin')}
              </Link>
            )}
            <Link to="/cart" className="p-2 transition hover:opacity-80" style={{ color: 'var(--color-secondary)' }}>
              <ShoppingCart className="w-6 h-6" />
            </Link>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 transition hover:opacity-80"
                style={{ color: 'var(--color-secondary)' }}
              >
                <User className="w-6 h-6" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b text-sm text-gray-600">
                        {user.firstname} {user.lastname}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        {t('nav.myProfile')}
                      </Link>
                      {admin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          {t('nav.admin')}
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                  )}
                </div>
              )}
            </div>
            <LanguageSelector />
          </nav>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ color: 'var(--color-secondary)' }}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4 flex flex-col gap-2" style={{ borderColor: 'var(--color-secondary)' }}>
            {navMenus.map((category) => (
              <div key={category.id}>
                <span className="font-medium" style={{ color: 'var(--color-secondary)' }}>{category.name}</span>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-4 mt-1 space-y-2">
                    {category.subcategories
                      .filter((sub) => sub.categoryType === 'SUBMENU')
                      .map((sub) => (
                        <div key={sub.id}>
                          <span className="block text-sm font-semibold opacity-90" style={{ color: 'var(--color-secondary)' }}>
                            {sub.name}
                          </span>
                          {sub.subcategories && sub.subcategories.length > 0 && (
                            <div className="ml-3 mt-1 space-y-1">
                              {sub.subcategories
                                .filter((item) => item.categoryType === 'ITEM')
                                .map((item) => (
                                  <Link
                                    key={item.id}
                                    to={getItemLink(item)}
                                    className="block text-sm opacity-80"
                                    style={{ color: 'var(--color-secondary)' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {getItemLabel(item)}
                                  </Link>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
            {admin && <Link to="/admin" className="font-medium" style={{ color: 'var(--color-secondary)' }}>{t('nav.admin')}</Link>}
            <Link to="/cart" className="font-medium" style={{ color: 'var(--color-secondary)' }}>{t('nav.cart')}</Link>
            {user ? (
              <>
                <Link to="/profile" className="font-medium" style={{ color: 'var(--color-secondary)' }}>{t('nav.myProfile')}</Link>
                <button onClick={logout} className="text-left font-medium text-red-600">{t('nav.logout')}</button>
              </>
            ) : (
              <Link to="/login" className="font-medium" style={{ color: 'var(--color-secondary)' }}>{t('nav.login')}</Link>
            )}
          </nav>
        )}
      </div>

      {hoveredMenu && hoveredMenu.subcategories && hoveredMenu.subcategories.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full w-full shadow-2xl z-[9999] border-t border-black/5"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={() => setHoveredCategory(hoveredMenu.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex gap-10">
              <div className="w-[60%]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {hoveredMenu.subcategories
                    .filter((sub) => sub.categoryType === 'SUBMENU')
                    .map((sub) => (
                      <div key={sub.id} className="flex flex-col gap-3">
                        <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--color-secondary)' }}>
                          {sub.name}
                        </span>
                        {sub.subcategories && sub.subcategories.length > 0 && (
                          <div className="space-y-2">
                            {sub.subcategories
                              .filter((item) => item.categoryType === 'ITEM')
                              .map((item) => (
                                <Link
                                  key={item.id}
                                  to={getItemLink(item)}
                                  className="block text-sm font-normal opacity-80 hover:opacity-100 transition-opacity"
                                  style={{ color: 'var(--color-secondary)' }}
                                  onClick={() => setHoveredCategory(null)}
                                >
                                  {getItemLabel(item)}
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              <div className="w-[40%] min-h-[220px]">
                {menuImages.length > 0 ? (
                  <div className={`grid gap-4 h-full ${menuImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {menuImages.map((image) => (
                      <div key={image.id} className="relative overflow-hidden rounded-lg h-full min-h-[200px]">
                        <img
                          src={toImageSrc(image.src)}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-sm font-bold uppercase tracking-wide">{image.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[220px] rounded-lg bg-transparent" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default AppHeader
