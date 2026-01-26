import type { UserProfileStateType } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import { MediaModel } from '../media/media-api.postgres-model'
import type { UserModel } from './user-api.postgres-model'

export async function getUserProfileState(
  user: UserModel,
  _isAuthenticated: boolean,
): Promise<UserProfileStateType> {
  try {
    // common items
    const id = user.id
    const defaultEmail = user.emails.find((e) => e.default)
    const defaultPhone = user.phones.find((e) => e.default)
    const mailVerified = !!defaultEmail?.verifiedAt
    const phoneVerified = !!defaultPhone?.verifiedAt
    const connectedDevice = await user.fetchConnectedDevice()
    const profileImage = await MediaModel.findPrimaryProfile(id)

    const profile: UserProfileStateType = {
      a: user.isAdmin || user.isSuperAdmin,
      b: user.optInBeta,
      device: {
        hasBiometricSetup: connectedDevice?.hasBiometricSetup || false,
        id: connectedDevice?.id || '',
      },
      emails: await user.getEmailData(),
      firstName: user.firstName,
      fullName: user.fullName,
      hasSecuredAccount: await user.hasSecuredAccount(),
      hasVerifiedEmail: mailVerified,
      hasVerifiedPhone: phoneVerified,
      id,
      lastName: user.lastName,
      phones: await user.getPhoneData(),
      profileImage: profileImage?.id || null,
      restrictions: user.restrictions || [],
      role: user.roles,
      sa: user.isSuperAdmin,
      username: user.username,
    }

    return profile
  } catch (err) {
    const msg = `Error resolving user profile: ${err.message || err}`
    ApiLoggingClass.instance.logError(msg)
    throw new Error(msg)
  }
}
