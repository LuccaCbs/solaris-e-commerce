import { Link, useLocation, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Settings,
  Store,
  LogOut,
} from 'lucide-react'
import LanguageSelector from './LanguageSelector'

const adminNavItems = [
  { path: '/admin', labelKey: 'admin.dashboard.title', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', labelKey: 'admin.product.title', icon: Package },
  { path: '/admin/categories', labelKey: 'admin.category.title', icon: FolderTree },
  { path: '/admin/customers', labelKey: 'admin.customer.title', icon: Users },
  { path: '/admin/config', labelKey: 'admin.config.title', icon: Settings },
]

const AdminLayout = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2 text-gray-900 font-bold">
            <Store className="w-5 h-5" />
            Solaris Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map(({ path, labelKey, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === path
              : location.pathname.startsWith(path)
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t space-y-2">
          <LanguageSelector />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            {t('common.logout', 'Cerrar sesión')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
