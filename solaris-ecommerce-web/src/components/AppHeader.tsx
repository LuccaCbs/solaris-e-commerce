import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import LanguageSelector from './LanguageSelector'
import { getStoredUser, isAdminUser, logout } from '../utils/auth'

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
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-yellow-400 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to={admin ? '/admin' : '/'} className="flex-shrink-0">
            <span className="text-2xl font-bold text-gray-900">{t('home.title')}</span>
          </Link>

          {showSearch && onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={t('common.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 p-1 rounded">
                  <Search className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          <nav className="hidden md:flex items-center gap-4">
            {admin && (
              <>
                <Link to="/admin/products" className="text-gray-800 hover:text-gray-900 font-medium text-sm">
                  {t('nav.products')}
                </Link>
                <Link to="/admin/categories" className="text-gray-800 hover:text-gray-900 font-medium text-sm">
                  {t('nav.categories')}
                </Link>
                <Link to="/admin/featured" className="text-gray-800 hover:text-gray-900 font-medium text-sm">
                  {t('nav.featured')}
                </Link>
              </>
            )}
            {!admin && (
              <>
                <Link to="/catalog" className="text-gray-800 hover:text-gray-900 font-medium text-sm">
                  {t('nav.categories')}
                </Link>
                <Link to="/catalog" className="text-gray-800 hover:text-gray-900 font-medium text-sm">
                  {t('nav.offers')}
                </Link>
              </>
            )}
            <Link to="/cart" className="p-2 text-gray-800 hover:text-gray-900">
              <ShoppingCart className="w-6 h-6" />
            </Link>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 text-gray-800 hover:text-gray-900"
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

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-yellow-500 pt-4 flex flex-col gap-2">
            {admin && (
              <>
                <Link to="/admin/products" className="text-gray-800 font-medium">{t('nav.products')}</Link>
                <Link to="/admin/categories" className="text-gray-800 font-medium">{t('nav.categories')}</Link>
                <Link to="/admin/featured" className="text-gray-800 font-medium">{t('nav.featured')}</Link>
              </>
            )}
            <Link to="/cart" className="text-gray-800 font-medium">{t('nav.cart')}</Link>
            {user ? (
              <>
                <Link to="/profile" className="text-gray-800 font-medium">{t('nav.myProfile')}</Link>
                <button onClick={logout} className="text-left text-red-600 font-medium">{t('nav.logout')}</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-800 font-medium">{t('nav.login')}</Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default AppHeader
