export interface WhatsAppInfo {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken?: string;
  appSecret: string;
  lastSyncedAt?: Date;
}

// Instagram integration configuration
export interface InstagramInfo {
  accessToken: string;
  accountId: string;
  pageId: string;
  appSecret: string;
  lastSyncedAt?: Date;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  whatsappInfo?: WhatsAppInfo;
  instagramInfo?: InstagramInfo;
}
