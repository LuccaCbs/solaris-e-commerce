import apiClient from './axiosClient'

export type ChangePasswordData = {
  currentPassword: string
  newPassword: string
}

export const profileService = {
  changePassword: async (userId: number, data: ChangePasswordData): Promise<void> => {
    await apiClient.post(`/profile/${userId}/change-password`, data)
  },
}
