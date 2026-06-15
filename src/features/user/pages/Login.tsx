import { useState, type ComponentProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import artGallery from '../../../assets/artgallery.png'
import AppFooter from '../../../components/AppFooter'
import AppHeader from '../../../components/AppHeader'
import {
  beginPreferencesOnboarding,
  clearAuthenticatedUsername,
  saveAuthenticatedUsername,
} from '../../../api/authStorage'
import { getHomeRecommendations } from '../../../api/homeApi'
import { useAuthStatus } from '../../../hooks/useAuthStatus'
import { ApiError, guestLogin, login as loginUser } from '../api/authApi'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

function Login() {
  const navigate = useNavigate()
  const { setAuthTokens } = useAuthStatus()
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '')
    const password = String(formData.get('password') ?? '')

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const tokens = await loginUser({ username, password })
      setAuthTokens(tokens)
      saveAuthenticatedUsername(username)

      try {
        const recommendations = await getHomeRecommendations()

        navigate('/', { replace: true, state: { recommendations } })
      } catch (error) {
        navigate('/', {
          replace: true,
          state: {
            recommendationMessage: error instanceof ApiError && error.status === 401
              ? '로그인이 만료되었습니다. 다시 로그인하면 맞춤 추천을 확인할 수 있습니다.'
              : '추천 이벤트를 불러오지 못했습니다.',
          },
        })
      }
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.status === 401
          ? '아이디 또는 비밀번호가 올바르지 않습니다.'
          : '로그인 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGuestLogin = async () => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const tokens = await guestLogin()
      setAuthTokens(tokens)
      clearAuthenticatedUsername()
      beginPreferencesOnboarding()
      navigate('/user/preferences', { replace: true, state: { fromSignup: true } })
    } catch {
      setErrorMessage('게스트 로그인 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page" aria-label="Arbit login">
      <AppHeader />

      <div className="login-content">
        <section className="login-card" aria-label="로그인">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-label">아이디</span>
              <span className="login-control">
                <UserIcon />
                <input
                  type="text"
                  name="username"
                  placeholder="아이디를 입력해주세요"
                  autoComplete="username"
                  required
                />
              </span>
            </label>

            <label className="login-field">
              <span className="login-label">비밀번호</span>
              <span className="login-control">
                <LockIcon />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </span>
            </label>

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" />
                <span>로그인 유지</span>
              </label>
              <button className="login-find" type="button">
                계정 찾기
              </button>
            </div>

            {errorMessage && (
              <p className="login-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? '로그인 중' : '로그인하기'}</span>
              <ChevronRightIcon />
            </button>
            <button
              className="login-guest"
              type="button"
              disabled={isSubmitting}
              onClick={handleGuestLogin}
            >
              게스트로 로그인하기
            </button>
          </form>

          <div className="login-divider" />

          <p className="login-signup">
            처음 오셨나요? <Link to="/user/signup">회원 가입하기</Link>
          </p>
        </section>

        <img className="login-gallery" src={artGallery} alt="" aria-hidden="true" />
      </div>

      <AppFooter />
    </main>
  )
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="9.5" r="2.8" />
      <path d="M6.9 17.2c1.1-2.4 2.8-3.6 5.1-3.6s4 1.2 5.1 3.6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <rect x="6.5" y="10" width="11" height="9" rx="1.6" />
      <path d="M9 10V7.8a3 3 0 0 1 6 0V10" />
      <path d="M12 14.1v1.8" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}

export default Login
