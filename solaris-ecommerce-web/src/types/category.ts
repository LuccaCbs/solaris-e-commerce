export type MenuProduct = {
  id: number
  name: string
}

export type Category = {
  id: number
  name: string
  description: string
  createdAt: string
  systemCategory: boolean
  active?: boolean
  parentId?: number | null
  parentName?: string | null
  imageData?: string | null
  categoryType?: 'MENU' | 'SUBMENU' | 'ITEM'
  productId?: number | null
  productName?: string | null
  subcategories?: Category[]
  products?: MenuProduct[]
}
