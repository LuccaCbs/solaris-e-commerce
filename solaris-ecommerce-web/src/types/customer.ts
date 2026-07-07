export type DocumentType = 'CUIT' | 'CUIL' | 'DNI'

export type CondicionIva =
  | 'RESPONSABLE_INSCRIPTO'
  | 'MONOTRIBUTO'
  | 'EXENTO'
  | 'CONSUMIDOR_FINAL'
  | 'NO_CATEGORIZADO'
  | 'RESPONSABLE_NO_INSCRIPTO'

export type CustomerDocument = {
  id?: number
  documentType: DocumentType
  documentNumber: string
  primary?: boolean
}

export type Customer = {
  id: number
  razonSocial: string
  cuit: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  country: string | null
  taxCondition: CondicionIva
  active?: boolean
  userId?: number
  createdAt: string
}

export type CustomerRequest = {
  razonSocial: string
  cuit: string
  email?: string
  phone?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  country?: string
  taxCondition: CondicionIva
}
