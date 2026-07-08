import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../api/authService'
import LanguageSelector from '../../components/LanguageSelector'

const RegisterPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data))
        toast.success(data.message || t('register.success'))
        navigate(['ADMIN', 'STAFF'].includes(data.role || '') ? '/admin' : '/')
        return
      }
      setRegisteredEmail(data.email)
      if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl)
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || t('register.error')
      toast.error(message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('register.passwordMismatch'))
      return
    }

    registerMutation.mutate({
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      password: formData.password,
    })
  }

  if (registeredEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('register.checkEmailTitle')}
          </h2>
          <p className="text-gray-600 mb-2">
            {t('register.checkEmailMessage')}
          </p>
          <p className="text-blue-600 font-medium flex items-center justify-center gap-2 mb-6">
            <Mail className="w-4 h-4" />
            {registeredEmail}
          </p>
          {verificationUrl && (
            <p className="text-sm text-gray-500 mb-4 break-all">
              <a href={verificationUrl} className="text-blue-600 hover:underline">
                {verificationUrl}
              </a>
            </p>
          )}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            {t('register.login')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          {t('register.title')}
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.firstname')}
            </label>
            <input
              type="text"
              id="firstname"
              required
              value={formData.firstname}
              onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('register.namePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.lastname')}
            </label>
            <input
              type="text"
              id="lastname"
              required
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('register.namePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.email')}
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('register.emailPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.password')}
            </label>
            <input
              type="password"
              id="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('register.passwordPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('register.confirmPasswordPlaceholder')}
            />
          </div>
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {registerMutation.isPending ? t('common.loading') : t('register.submit')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            {t('register.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
