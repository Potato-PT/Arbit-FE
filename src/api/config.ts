const DEFAULT_API_BASE_URL = import.meta.env.DEV ? '' : 'https://piec.store'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
