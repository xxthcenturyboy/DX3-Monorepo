/**
 * Mock for @sendgrid/mail
 * Provides comprehensive mocking for SendGrid email functionality
 */

/**
 * Mock MailSendgrid class instance
 */
export const mockMailSendgridInstance = {
  sendAccountAlert: jest.fn().mockResolvedValue('mock-message-id'),
  sendConfirmation: jest.fn().mockResolvedValue('mock-message-id'),
  sendInvite: jest.fn().mockResolvedValue('mock-message-id'),
  sendOtp: jest.fn().mockResolvedValue('mock-message-id'),
}

// Mock MailSendgrid
jest.mock('./mail-api-sendgrid', () => ({
  MailSendgrid: jest.fn().mockImplementation(() => mockMailSendgridInstance),
}))

/**
 * Setup function for MailSendgrid mocking
 */
export const mockMailSendgrid = () => {
  // MailSendgrid is already mocked at the top level
  // This function exists for consistency with other mock setup functions
}

/**
 * Helper to reset SendGrid mocks
 *
 * @example
 * import { resetSendgridMocks } from '../testing/mocks';
 * resetSendgridMocks();
 */
export const resetSendgridMocks = () => {
  mockMailSendgridInstance.sendConfirmation.mockClear()
  mockMailSendgridInstance.sendInvite.mockClear()
  mockMailSendgridInstance.sendAccountAlert.mockClear()
  mockMailSendgridInstance.sendOtp.mockClear()
}
