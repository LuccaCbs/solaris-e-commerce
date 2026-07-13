import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from '../features/home/HomePage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import VerifyEmailPage from '../features/auth/VerifyEmailPage'
import CartPage from '../features/cart/CartPage'
import ProductManagementPage from '../features/admin/ProductManagementPage'
import CategoryManagementPage from '../features/admin/CategoryManagementPage'
import CustomerManagementPage from '../features/admin/CustomerManagementPage'
import DashboardPage from '../features/admin/DashboardPage'
import StoreConfigPage from '../features/admin/StoreConfigPage'
import FeaturedProductsPage from '../features/admin/FeaturedProductsPage'
import FeaturedCategoriesPage from '../features/admin/FeaturedCategoriesPage'
import AppearanceConfigPage from '../features/admin/AppearanceConfigPage'
import MenuConfigPage from '../features/admin/MenuConfigPage'
import ProfilePage from '../features/profile/ProfilePage'
import AdminLayout from '../components/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/catalog" element={<Navigate to="/" replace />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductManagementPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="menu-config" element={<MenuConfigPage />} />
        <Route path="featured" element={<FeaturedProductsPage />} />
        <Route path="featured-categories" element={<FeaturedCategoriesPage />} />
        <Route path="customers" element={<CustomerManagementPage />} />
        <Route path="appearance" element={<AppearanceConfigPage />} />
        <Route path="config" element={<StoreConfigPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
