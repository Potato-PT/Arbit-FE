const DEFAULT_API_BASE_URL = import.meta.env.DEV ? '' : 'http://34.138.160.76:8080'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
