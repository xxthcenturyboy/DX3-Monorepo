export type FeatureFlagsStateType = {
  flags: Record<string, boolean>
  isLoading: boolean
  lastFetched: number | null
}
