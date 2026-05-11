import { useEffect, useState } from 'react'

const AUTH_STORAGE_KEY = 'arbit.isLoggedIn'

function readLoginStatus() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
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

  return {
    isLoggedIn,
    accountPath: isLoggedIn ? '/user/mypage' : '/user/login',
    accountLabel: isLoggedIn ? '마이페이지' : '로그인',
    setIsLoggedIn,
  }
}
