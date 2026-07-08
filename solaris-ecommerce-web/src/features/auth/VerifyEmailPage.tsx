import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { authService } from '../../api/authService'
import LanguageSelector from '../../components/LanguageSelector'

const VerifyEmailPage = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage(t('verifyEmail.noToken'))
      return
    }

    authService
      .verifyEmail(token)
      .then((data) => {
        setStatus('success')
        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data))
        }
        setTimeout(() => {
          navigate(['ADMIN', 'STAFF'].includes(data.role || '') ? '/admin' : '/')
        }, 2500)
      })
      .catch((error) => {
        setStatus('error')
        setErrorMessage(error?.response?.data?.message || t('verifyEmail.error'))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('verifyEmail.verifying')}</h2>
            <p className="text-gray-600">{t('verifyEmail.pleaseWait')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('verifyEmail.successTitle')}</h2>
            <p className="text-gray-600">{t('verifyEmail.successMessage')}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('verifyEmail.errorTitle')}</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              {t('verifyEmail.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailPage
