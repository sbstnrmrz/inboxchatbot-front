export interface CustomerWhatsAppInfo {
  id: string
  name: string
}

export interface CustomerInstagramInfo {
  accountId: string
  name?: string
  username?: string
}

export interface Customer {
  _id: string
  tenantId: string
  name: string
  whatsappInfo?: CustomerWhatsAppInfo
  instagramInfo?: CustomerInstagramInfo
  isBlocked: boolean
  createdAt?: string
  updatedAt?: string
}
