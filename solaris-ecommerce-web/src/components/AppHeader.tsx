import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import LanguageSelector from './LanguageSelector'
import { getStoredUser, isAdminUser, logout } from '../utils/auth'
import { categoryService } from '../api/categoryService'
import { toImageSrc } from '../api/productImageService'

type AppHeaderProps = {
  searchTerm?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
}

const AppHeader = ({ searchTerm = '', onSearchChange, showSearch = true }: AppHeaderProps) => {
  const { t } = useTranslation()
  const user = getStoredUser()
  const admin = isAdminUser(user)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const categoryMenuRef = useRef<HTMLDivElement>(null)

  const { data: categoryTree = [] } = useQuery({
    queryKey: ['category-tree'],
    queryFn: categoryService.getCategoryTree,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setHoveredCategory(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
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
            {categoryTree.filter(cat => cat.categoryType === 'MENU').map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button className="flex items-center gap-1 font-medium text-sm transition hover:opacity-80" style={{ color: 'var(--color-secondary)' }}>
                  {category.name.toLowerCase()}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {hoveredCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-0 w-screen bg-white shadow-xl z-50" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {category.subcategories.filter(sub => sub.categoryType === 'SUBMENU').map((sub) => (
                          <div key={sub.id} className="flex flex-col items-center gap-3 p-4 rounded-lg hover:opacity-80 transition">
                            {sub.imageData && (
                              <img src={toImageSrc(sub.imageData)} alt={sub.name} className="w-20 h-20 rounded-lg object-cover" />
                            )}
                            <span className="text-sm font-medium text-center" style={{ color: 'var(--color-secondary)' }}>{sub.name.toLowerCase()}</span>
                            {sub.subcategories && sub.subcategories.length > 0 && (
                              <div className="w-full mt-2 pt-2 border-t space-y-1" style={{ borderColor: 'var(--color-secondary)', opacity: 0.5 }}>
                                {sub.subcategories.filter(item => item.categoryType === 'ITEM').map((item) => (
                                  <Link
                                    key={item.id}
                                    to="/"
                                    className="block text-xs text-center py-1 hover:opacity-80"
                                    style={{ color: 'var(--color-secondary)' }}
                                    onClick={() => setHoveredCategory(null)}
                                  >
                                    {item.name.toLowerCase()}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/" className="font-medium text-sm transition hover:opacity-80" style={{ color: 'var(--color-secondary)' }}>
              {t('nav.featured')}
            </Link>
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
            {categoryTree.map((category) => (
              <div key={category.id}>
                <Link to="/" className="font-medium" style={{ color: 'var(--color-secondary)' }}>{category.name.toLowerCase()}</Link>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1">
                    {category.subcategories.map((sub) => (
                      <Link key={sub.id} to="/" className="block text-sm opacity-80" style={{ color: 'var(--color-secondary)' }}>
                        {sub.name.toLowerCase()}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/" className="font-medium" style={{ color: 'var(--color-secondary)' }}>{t('nav.featured')}</Link>
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
    </header>
  )
}

export default AppHeader
