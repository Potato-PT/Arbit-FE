import type { ComponentProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import artGallery from '../../../assets/artgallery.png'
import logo from '../../../assets/logo.png'
import AppFooter from '../../../components/AppFooter'
import { useAuthStatus } from '../../../hooks/useAuthStatus'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

function Login() {
  const navigate = useNavigate()
  const { setIsLoggedIn } = useAuthStatus()

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault()
    setIsLoggedIn(true)
    navigate('/user/mypage')
  }

  return (
    <main className="login-page" aria-label="Arbit login">
      <div className="login-content">
        <Link className="login-brand" to="/" aria-label="Arbit home">
          <img src={logo} alt="Arbit" />
        </Link>

        <section className="login-card" aria-label="로그인">
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-label">아이디</span>
              <span className="login-control">
                <UserIcon />
                <input type="text" placeholder="아이디를 입력해주세요" autoComplete="username" />
              </span>
            </label>

            <label className="login-field">
              <span className="login-label">비밀번호</span>
              <span className="login-control">
                <LockIcon />
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <button className="login-submit" type="submit">
              <span>로그인하기</span>
              <ChevronRightIcon />
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
