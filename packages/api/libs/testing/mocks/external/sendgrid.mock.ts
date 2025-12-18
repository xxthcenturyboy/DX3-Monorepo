/**
 * Mock for @sendgrid/mail
 * Provides comprehensive mocking for SendGrid email functionality
 */

// Mock external SendGrid libraries
jest.mock('@sendgrid/mail', () => ({
  send: jest.fn().mockResolvedValue([
    {
      body: {},
      headers: {
        'x-message-id': 'mock-message-id-123',
        'x-smtpapi': 'mock-smtpapi',
      },
      statusCode: 202,
    },
  ]),
  setApiKey: jest.fn(),
  setClient: jest.fn(),
  setSubstitutionWrappers: jest.fn(),
}))

jest.mock('@sendgrid/client', () => ({
  setApiKey: jest.fn(),
  setDefaultRequest: jest.fn(),
}))

export const mockSendgrid = () => {
  // SendGrid libraries are already mocked at the top level
  // This function exists for consistency with other mock setup functions
}

/**
 * Helper to mock SendGrid errors
 *
 * @example
 * import { mockSendgridError } from '../testing/mocks';
 * mockSendgridError('SendGrid API error');
 */
export const mockSendgridError = (errorMessage: string) => {
  const { default: sgMail } = require('@sendgrid/mail')
  sgMail.send.mockRejectedValue(new Error(errorMessage))
}
