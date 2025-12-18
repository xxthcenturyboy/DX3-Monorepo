export type LogLevelType = 'log' | 'warn' | 'error'

// biome-ignore lint/suspicious/noExplicitAny: Allow any for logging parameters
export type LogFnType = (message?: any, ...optionalParams: any[]) => void
