import { Link, useLocation, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Settings,
  Star,
  Palette,
} from 'lucide-react'
import AppHeader from './AppHeader'

const adminNavItems = [
  { path: '/admin', labelKey: 'admin.dashboard.title', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', labelKey: 'nav.products', icon: Package },
  { path: '/admin/categories', labelKey: 'nav.categories', icon: FolderTree },
  { path: '/admin/featured', labelKey: 'nav.featured', icon: Star },
  { path: '/admin/customers', labelKey: 'admin.customer.title', icon: Users },
  { path: '/admin/appearance', labelKey: 'admin.appearance.title', icon: Palette },
  { path: '/admin/config', labelKey: 'admin.config.title', icon: Settings },
]

const AdminLayout = () => {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader showSearch={false} />
      <div className="flex flex-1">
        <aside className="w-56 bg-white shadow-md flex-shrink-0 hidden lg:block">
          <nav className="p-4 space-y-1">
            {adminNavItems.map(({ path, labelKey, icon: Icon, exact }) => {
              const isActive = exact
                ? location.pathname === path
                : location.pathname.startsWith(path)
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(labelKey)}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
