const mockDispatch = jest.fn()
const mockGetState = jest.fn().mockReturnValue({
  i18n: { currentLocale: 'en' },
})

jest.mock('../../store/store-web.redux', () => ({
  store: {
    dispatch: mockDispatch,
    getState: mockGetState,
  },
}))

jest.mock('../../i18n', () => ({
  i18nActions: {
    setCurrentLocale: jest.fn((locale) => ({ payload: locale, type: 'i18n/setCurrentLocale' })),
    setError: jest.fn((err) => ({ payload: err, type: 'i18n/setError' })),
    setLoading: jest.fn((v) => ({ payload: v, type: 'i18n/setLoading' })),
    setTranslations: jest.fn((t) => ({ payload: t, type: 'i18n/setTranslations' })),
  },
  i18nService: {
    getPreferredLocale: jest.fn().mockResolvedValue('en'),
    loadLocale: jest.fn().mockResolvedValue({ ABOUT: 'About', DASHBOARD: 'Dashboard' }),
  },
}))

jest.mock('@dx3/web-libs/utils/fingerprint-web.service', () => ({
  FingerprintWebService: jest.fn().mockImplementation(() => ({})),
}))

import { appBootstrap } from './app-bootstrap'

describe('appBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetState.mockReturnValue({
      i18n: { currentLocale: 'en' },
    })
  })

  it('should be a function', () => {
    expect(typeof appBootstrap).toBe('function')
  })

  it('should return a Promise', () => {
    const result = appBootstrap()
    expect(result).toBeInstanceOf(Promise)
  })

  it('should dispatch setLoading(true) during initialization', async () => {
    await appBootstrap()
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'i18n/setLoading' }))
  })

  it('should dispatch setTranslations after loading locale', async () => {
    await appBootstrap()
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'i18n/setTranslations' }),
    )
  })

  it('should handle i18n init error gracefully', async () => {
    const { i18nService } = await import('../../i18n')
    ;(i18nService.loadLocale as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    await expect(appBootstrap()).resolves.not.toThrow()
    expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'i18n/setError' }))
  })
})
