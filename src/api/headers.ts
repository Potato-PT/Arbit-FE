import { isJwtLike, readAccessToken } from './authStorage'

function readFallbackAccessToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem('accessToken') ?? ''
}

export function getAccessTokenForApi() {
  return readAccessToken() || readFallbackAccessToken()
}

export function createAuthorizationHeaders(): Record<string, string> {
  const accessToken = getAccessTokenForApi().trim()

  if (!accessToken || !isJwtLike(accessToken)) {
    return {}
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}

export function createJsonHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...createAuthorizationHeaders(),
  }
}

export function createUploadHeaders(): Record<string, string> {
  return createAuthorizationHeaders()
}
