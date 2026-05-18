import { useEffect, useState } from 'react'
import type { AuthTokenResponse } from '../features/user/api/authApi'

const AUTH_STORAGE_KEY = 'arbit.isLoggedIn'
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'

function readLoginStatus() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true' ||
    Boolean(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
  )
}

export function useAuthStatus() {
  const [isLoggedIn, setIsLoggedInState] = useState(readLoginStatus)

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedInState(readLoginStatus())
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('arbit-auth-change', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('arbit-auth-change', handleStorageChange)
    }
  }, [])

  const setIsLoggedIn = (nextIsLoggedIn: boolean) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, String(nextIsLoggedIn))
    window.dispatchEvent(new Event('arbit-auth-change'))
    setIsLoggedInState(nextIsLoggedIn)
  }

  const setAuthTokens = ({ accessToken, refreshToken }: AuthTokenResponse) => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
    setIsLoggedIn(true)
  }

  return {
    isLoggedIn,
    accountPath: isLoggedIn ? '/user/mypage' : '/user/login',
    accountLabel: isLoggedIn ? '마이페이지' : '로그인',
    setIsLoggedIn,
    setAuthTokens,
  }
}
