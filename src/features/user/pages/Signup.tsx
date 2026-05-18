import { useMemo, useState, type ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../../components/AppHeader'
import AppFooter from '../../../components/AppFooter'
import '../styles/Signup.css'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

const minPasswordLength = 8

function Signup() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: currentYear - 1940 - 9 }, (_, index) => currentYear - 10 - index)
  }, [])
  const hasPassword = password.length > 0
  const hasPasswordConfirmation = passwordConfirmation.length > 0
  const isPasswordLongEnough = password.length >= minPasswordLength
  const doPasswordsMatch = password === passwordConfirmation
  const shouldShowPasswordLengthError = hasPassword && !isPasswordLongEnough
  const shouldShowPasswordMatchError =
    hasPasswordConfirmation && isPasswordLongEnough && !doPasswordsMatch
  const isPasswordValid = hasPassword && isPasswordLongEnough && doPasswordsMatch

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault()

    if (!isPasswordValid) {
      return
    }

    navigate('/user/preferences')
  }

  return (
    <main className="signup-page" aria-label="회원가입">
      <AppHeader variant="warm" />

      <section className="signup-main">
        <div className="signup-form-wrap">
          <span className="signup-overline">회원가입</span>
          <h1>
            Arbit에 오신 것을
            <br />
            환영합니다
          </h1>
          <p>
            계정 정보와 기본 프로필을 입력하시면 맞춤 문화 추천 서비스를 바로 시작할 수
            있어요.
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <label className="signup-field">
              <span>아이디</span>
              <input
                type="text"
                placeholder="영문·숫자 조합 6자 이상"
                autoComplete="username"
                maxLength={20}
                required
              />
            </label>

            <label
              className={
                shouldShowPasswordLengthError ? 'signup-field is-invalid' : 'signup-field'
              }
            >
              <span>비밀번호</span>
              <input
                type="password"
                placeholder="영문·숫자·특수문자 8자 이상"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={shouldShowPasswordLengthError}
                aria-describedby="signup-password-message"
                minLength={minPasswordLength}
                required
              />
              {shouldShowPasswordLengthError && (
                <em id="signup-password-message">
                  비밀번호는 {minPasswordLength}자 이상 입력해주세요.
                </em>
              )}
            </label>

            <label
              className={
                shouldShowPasswordMatchError ? 'signup-field is-invalid' : 'signup-field'
              }
            >
              <span>비밀번호 확인</span>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                aria-invalid={shouldShowPasswordMatchError}
                aria-describedby="signup-password-confirmation-message"
                required
              />
              {shouldShowPasswordMatchError && (
                <em id="signup-password-confirmation-message">
                  비밀번호가 일치하지 않습니다.
                </em>
              )}
            </label>

            <div className="signup-divider">
              <span />
              <strong>프로필 정보</strong>
              <span />
            </div>

            <label className="signup-field">
              <span>이름</span>
              <input type="text" placeholder="홍길동" autoComplete="name" required />
            </label>

            <label className="signup-field">
              <span>출생년도</span>
              <select
                className={birthYear ? '' : 'is-placeholder'}
                value={birthYear}
                onChange={(event) => setBirthYear(event.target.value)}
                required
              >
                <option value="" disabled>
                  선택
                </option>
                {yearOptions.map((year) => (
                  <option value={year} key={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </label>

            <label className="signup-field">
              <span>거주지역</span>
              <input
                type="text"
                placeholder="서울특별시 강남구 테헤란로 123"
                autoComplete="street-address"
                required
              />
              <em>도로명 주소 또는 지역명을 입력해주세요</em>
            </label>

            <button className="signup-submit" type="submit" disabled={!isPasswordValid}>
              계속하기
            </button>
          </form>
        </div>
      </section>

      <AppFooter />
    </main>
  )
}

export default Signup
