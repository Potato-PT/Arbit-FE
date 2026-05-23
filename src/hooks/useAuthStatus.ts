import { useEffect, useState } from 'react'
import type { AuthTokenResponse } from '../features/user/api/authApi'
import { hasStoredLoginStatus, saveAuthTokens, saveLoginStatus } from '../api/authStorage'

function readLoginStatus() {
  return hasStoredLoginStatus()
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
    saveLoginStatus(nextIsLoggedIn)
    window.dispatchEvent(new Event('arbit-auth-change'))
    setIsLoggedInState(nextIsLoggedIn)
  }

  const setAuthTokens = (tokens: AuthTokenResponse) => {
    saveAuthTokens(tokens)
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
