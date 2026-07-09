import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import AppHeader from '../../components/AppHeader'
import { profileService } from '../../api/profileService'
import { getStoredUser } from '../../utils/auth'

const ProfilePage = () => {
  const { t } = useTranslation()
  const user = getStoredUser()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      profileService.changePassword(user!.id!, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }),
    onSuccess: () => {
      toast.success(t('profile.passwordChanged'))
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('profile.passwordError'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('profile.passwordMismatch'))
      return
    }
    if (!user?.id) {
      toast.error(t('profile.notLoggedIn'))
      return
    }
    changePasswordMutation.mutate()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader showSearch={false} />
        <div className="max-w-md mx-auto mt-12 text-center text-gray-600">{t('profile.notLoggedIn')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader showSearch={false} />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
          <p className="text-gray-600 mb-6">{user.email}</p>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.changePassword')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.currentPassword')}
              </label>
              <input
                type="password"
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.confirmPassword')}
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
