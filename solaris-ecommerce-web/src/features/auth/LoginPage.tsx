import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../api/authService'
import LanguageSelector from '../../components/LanguageSelector'

const LoginPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [emailNotVerified, setEmailNotVerified] = useState(false)

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data))
        toast.success(t('login.success'))
        navigate(data.role === 'ADMIN' ? '/admin' : '/')
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || t('login.error')
      setEmailNotVerified(Boolean(error?.response?.data?.emailNotVerified))
      toast.error(message)
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => authService.resendVerification(formData.email),
    onSuccess: () => {
      toast.success(t('login.resendSuccess'))
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || t('login.resendError')
      toast.error(message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailNotVerified(false)
    loginMutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          {t('login.title')}
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.email')}
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>

          {emailNotVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 mb-2">{t('login.emailNotVerified')}</p>
                  <button
                    type="button"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                    className="text-sm font-medium text-yellow-800 underline hover:text-yellow-900 disabled:opacity-50"
                  >
                    {resendMutation.isPending ? t('common.loading') : t('login.resendVerification')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
          >
            {loginMutation.isPending ? t('common.loading') : t('login.submit')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-6">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            {t('login.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
