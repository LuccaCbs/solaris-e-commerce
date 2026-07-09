import apiClient from './axiosClient'

export type ProductImage = {
  id: number
  productId: number
  imageData: string
  displayOrder: number
  active: boolean
  createdAt: string
}

export const productImageService = {
  getByProduct: async (productId: number): Promise<ProductImage[]> => {
    const response = await apiClient.get(`/products/${productId}/images`)
    return response.data
  },

  upload: async (productId: number, imageData: string, displayOrder = 0): Promise<ProductImage> => {
    const response = await apiClient.post(`/products/${productId}/images`, {
      productId,
      imageData,
      displayOrder,
    })
    return response.data
  },

  remove: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/products/${productId}/images/${imageId}`)
  },
}

export const toImageSrc = (imageData: string) => {
  if (imageData.startsWith('data:')) return imageData
  return `data:image/jpeg;base64,${imageData}`
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
