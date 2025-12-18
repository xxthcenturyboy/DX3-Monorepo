export type DeviceAuthType = {
  carrier?: string
  deviceCountry?: string
  deviceId?: string
  // multiSigPubKey: string;
  name?: string
  uniqueDeviceId: string
}

export type DeviceType = {
  biomAuthPubKey: string
  carrier: string
  createdAt: Date
  deletedAt: Date | null
  deviceCountry: string
  deviceId: string
  fcmToken: string
  id: string
  name: string
  uniqueDeviceId: string
  userId: string
  verificationToken: string
  verifiedAt: Date | null
}
