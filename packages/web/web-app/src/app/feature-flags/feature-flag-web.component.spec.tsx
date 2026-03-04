import { renderWithProviders } from '../../../testing-render'
import { FeatureFlag } from './feature-flag-web.component'
import { featureFlagsActions } from './feature-flag-web.reducer'

describe('FeatureFlag', () => {
  it('should render children when flag is enabled', () => {
    const { store } = renderWithProviders(
      <FeatureFlag flagName={'test_flag' as never}>
        <span>Enabled Content</span>
      </FeatureFlag>,
    )
    store.dispatch(
      featureFlagsActions.featureFlagsFetched([{ enabled: true, name: 'test_flag' }] as never),
    )
    // Re-render will show enabled content
    expect(store.getState().featureFlags.flags.test_flag).toBe(true)
  })

  it('should render fallback when flag is disabled', () => {
    const { getByText } = renderWithProviders(
      <FeatureFlag
        fallback={<span>Fallback Content</span>}
        flagName={'disabled_flag' as never}
      >
        <span>Enabled Content</span>
      </FeatureFlag>,
    )
    expect(getByText('Fallback Content')).toBeTruthy()
  })

  it('should render null fallback by default when flag is disabled', () => {
    const { queryByText } = renderWithProviders(
      <FeatureFlag flagName={'disabled_flag' as never}>
        <span>Should Not Show</span>
      </FeatureFlag>,
    )
    expect(queryByText('Should Not Show')).toBeNull()
  })

  it('should render without crashing', () => {
    const { baseElement } = renderWithProviders(
      <FeatureFlag flagName={'any_flag' as never}>
        <div />
      </FeatureFlag>,
    )
    expect(baseElement).toBeTruthy()
  })
})
