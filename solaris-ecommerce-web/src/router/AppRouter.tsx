import { Routes, Route } from 'react-router-dom'
import HomePage from '../features/home/HomePage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import VerifyEmailPage from '../features/auth/VerifyEmailPage'
import CatalogPage from '../features/catalog/CatalogPage'
import CartPage from '../features/cart/CartPage'
import ProductManagementPage from '../features/admin/ProductManagementPage'
import CategoryManagementPage from '../features/admin/CategoryManagementPage'
import CustomerManagementPage from '../features/admin/CustomerManagementPage'
import DashboardPage from '../features/admin/DashboardPage'
import StoreConfigPage from '../features/admin/StoreConfigPage'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/admin" element={<DashboardPage />} />
      <Route path="/admin/products" element={<ProductManagementPage />} />
      <Route path="/admin/categories" element={<CategoryManagementPage />} />
      <Route path="/admin/customers" element={<CustomerManagementPage />} />
      <Route path="/admin/config" element={<StoreConfigPage />} />
      {/* Rutas adicionales se agregarán aquí */}
    </Routes>
  )
}

export default AppRouter
