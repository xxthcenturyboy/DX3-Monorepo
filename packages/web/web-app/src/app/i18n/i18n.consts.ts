/**
 * i18n Constants
 *
 * Configuration constants for the internationalization system.
 */

import type { LocaleCode, StringKeys } from './i18n.types'

/**
 * Default locale code used as fallback.
 */
export const DEFAULT_LOCALE: LocaleCode = 'en'

/**
 * Default English strings - bundled inline as ultimate fallback.
 * These are always available even if network requests fail.
 */
export const DEFAULT_STRINGS: StringKeys = {
  ACCOUNT_MENU: 'Account Menu',
  ADD: 'Add',
  APP_MENU: 'App Menu',
  ARRAY_BUFFERS: 'Array Buffers',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  AUTH_INVALID_CREDENTIALS: 'Invalid username or password.',
  AUTH_OTP_EXPIRED: 'Your verification code has expired. Please request a new one.',
  AUTH_OTP_INVALID: 'Invalid verification code. Please try again.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_TOKEN_INVALID: 'Your session is invalid. Please log in again.',
  AUTH_UNAUTHORIZED: 'You are not authorized to perform this action.',
  BACK: 'Back',
  CANCEL: 'Cancel',
  CHANGE_PASSWORD: 'Change Password',
  CHARACTERS_REMAINING: '{count} characters remaining.',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  CONFIRM_PASSWORD: 'Confirm Password',
  COULD_NOT_LOG_YOU_IN: 'Could not log you in. Please try again.',
  COULD_NOT_LOGOUT: 'Could not complete the logout request.',
  CREATE: 'Create',
  CREATE_PASSWORD: 'Create Password',
  DASHBOARD_WELCOME: 'Have a look around.',
  DEFAULT: 'Default',
  DELETE: 'Delete',
  EDIT: 'Edit',
  EMAIL: 'Email',
  EMAIL_ALREADY_EXISTS: 'This email address is already in use.',
  EMAIL_DELETE_FAILED: 'Failed to delete email. Please try again.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  EMAIL_NOT_FOUND: 'Email address not found.',
  EMAIL_SEND_FAILED: 'Failed to send email. Please try again.',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed. Please try again.',
  EMAILS: 'Emails',
  EXTERNAL: 'External',
  FILTER: 'Filter',
  GENERIC: 'An error occurred. Please try again.',
  GENERIC_BAD_REQUEST: 'Invalid request. Please check your input.',
  GENERIC_FORBIDDEN: 'You do not have permission to perform this action.',
  GENERIC_NOT_FOUND: 'The requested resource was not found.',
  GENERIC_SERVER_ERROR: 'A server error occurred. Please try again later.',
  GENERIC_VALIDATION_FAILED: 'Validation failed. Please check your input.',
  GREETING: 'Hello, {name}!',
  HEAP_TOTAL: 'Heap Total',
  HEAP_USED: 'Heap Used',
  LABEL: 'Label',
  LOADING: 'Loading...',
  LOG_OUT: 'Log Out',
  LOGIN: 'Login',
  LOGIN_TO_YOUR_ACCOUNT: 'Log in to your account',
  LOGOUT: 'Logout',
  MEDIA_FILE_COUNT_EXCEEDED: 'Too many files. Maximum {max} files allowed.',
  MEDIA_FILE_SIZE_EXCEEDED: 'File too large. Maximum size is {max} MB.',
  MEDIA_INVALID_TYPE: 'Invalid file type. Please upload a supported format.',
  MEDIA_UPLOAD_FAILED: 'File upload failed. Please try again.',
  MESSAGE: 'Message',
  NAME: 'Name',
  NETWORK: 'Network error. Please check your connection.',
  NEW_EMAIL: 'New Email',
  NEW_PHONE: 'New Phone',
  NO_DATA: 'No Data',
  NOT_FOUND: 'The requested resource was not found.',
  NOTIFICATION_CREATE_FAILED: 'Failed to create notification. Please try again.',
  NOTIFICATION_MISSING_PARAMS: 'Missing required notification parameters.',
  NOTIFICATION_MISSING_USER_ID: 'User ID is required for this notification.',
  NOTIFICATION_SERVER_ERROR: 'Notification service error. Please try again.',
  NOTIFICATIONS: 'Notifications',
  NOTIFICATIONS_WILL_APPEAR_HERE: 'Notifications will appear here as you receive them.',
  OTP_CHOOSE_METHOD: 'Choose where to send a one-time code.',
  PAGE_TITLE_ADMIN_USERS: 'Users',
  PAGE_TITLE_API_HEALTH: 'API Health',
  PAGE_TITLE_DASHBOARD: 'Dashboard',
  PAGE_TITLE_EDIT_USER: 'Edit User',
  PAGE_TITLE_PROFILE: 'Profile',
  PAGE_TITLE_USER_PROFILE: 'User Profile',
  PASSWORD: 'Password',
  PHONE: 'Phone',
  PHONE_ALREADY_EXISTS: 'This phone number is already in use.',
  PHONE_DELETE_FAILED: 'Failed to delete phone. Please try again.',
  PHONE_INVALID: 'Please enter a valid phone number.',
  PHONE_NOT_FOUND: 'Phone number not found.',
  PHONE_VERIFICATION_FAILED: 'Phone verification failed. Please try again.',
  PHONES: 'Phones',
  PING: 'Ping',
  PROFILE: 'Profile',
  READ: 'Read',
  REFRESH: 'Refresh',
  RESTRICTIONS: 'Restrictions',
  ROLES: 'Roles',
  RSS: 'RSS',
  SAVE: 'Save',
  SEND: 'Send',
  SEND_CODE: 'Send Code',
  SEND_PUSH_TO_PHONE: 'Send Push Notification To Phone',
  SEND_TO_ALL_USERS: 'Send to all users',
  SEND_TO_USER: 'Send to: {username}',
  SIGNUP: 'Sign-Up',
  SIGNUP_FOR_AN_ACCOUNT: 'Sign up for an account',
  START_OVER: 'Start Over',
  STATUS: 'Status',
  SUBMIT: 'Submit',
  SUCCESS_DELETED: 'Successfully deleted.',
  SUCCESS_SAVED: 'Successfully saved.',
  TITLE: 'Title',
  TOGGLE_DARK_MODE: 'Toggle Dark Mode',
  TOOLTIP_DELETE_EMAIL: 'Delete Email',
  TOOLTIP_DELETE_PHONE: 'Delete Phone',
  TOOLTIP_REFRESH_DATA: 'Refresh Data',
  TOOLTIP_REFRESH_LIST: 'Refresh List',
  TRY_WITH_ONE_TIME_CODE: 'Try with one-time code',
  TRY_WITH_USERNAME_AND_PASSWORD: 'Try with username and password',
  TYPE: 'Type',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  UPDATE: 'Update',
  USER_ALREADY_EXISTS: 'A user with this information already exists.',
  USER_CREATE_FAILED: 'Failed to create user. Please try again.',
  USER_NOT_FOUND: 'User not found.',
  USER_UPDATE_FAILED: 'Failed to update user. Please try again.',
  USERNAME: 'Username',
  VERIFIED: 'Verified',
  VERIFY: 'Verify',
  VERSION: 'Version',
  WELCOME_BACK: 'Welcome back, {name}!',
  WRITE: 'Write',
}

/**
 * Entity name for Redux slice identification.
 */
export const I18N_ENTITY_NAME = 'i18n' as const

/**
 * Interpolation placeholder regex pattern.
 * Matches {variableName} syntax.
 */
export const INTERPOLATION_REGEX = /\{(\w+)\}/g

/**
 * Base path for locale JSON files.
 */
export const LOCALES_BASE_PATH = '/assets/locales'
