export type FormFieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'COLOR' | 'CHECKBOX'

export type ProductFormField = {
  id?: number
  fieldKey: string
  label: string
  fieldType: FormFieldType
  required: boolean
  displayOrder: number
  options?: string[]
  placeholder?: string
}

export type ProductForm = {
  id: number
  productId: number
  productName?: string
  productMadeToOrder?: boolean
  active: boolean
  fields: ProductFormField[]
  createdAt?: string
  updatedAt?: string
}

export type ProductFormRequest = {
  productId: number
  active: boolean
  fields: ProductFormField[]
}

export const FORM_FIELD_TYPES: FormFieldType[] = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'SELECT',
  'COLOR',
  'CHECKBOX',
]
