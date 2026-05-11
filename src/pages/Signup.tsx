import { Link, useNavigate } from 'react-router-dom'
import '../styles/Signup.css'
import logo from '../assets/logo.png'

function Signup() {
  const navigate = useNavigate()

  return (
    <main className="signup-page" aria-label="Arbit signup">
      <section className="signup-panel">
        <Link className="signup-brand" to="/" aria-label="Arbit home">
          <img src={logo} alt="Arbit" />
        </Link>

        <header className="signup-header">
          <h1>회원 가입하기</h1>
          <p>회원 정보를 입력해 주세요</p>
        </header>

        <form
          className="signup-form"
          onSubmit={(event) => {
            event.preventDefault()
            navigate('/preferences')
          }}
        >
          <label className="signup-field">
            <span>아이디</span>
            <input type="text" placeholder="아이디를 입력해주세요" autoComplete="username" />
          </label>

          <label className="signup-field">
            <span>이름</span>
            <input type="text" placeholder="성함을 입력해주세요" autoComplete="name" />
          </label>

          <label className="signup-field">
            <span>비밀번호</span>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>

          <label className="signup-field">
            <span>비밀번호 확인</span>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>

          <label className="signup-field">
            <span>출생년도</span>
            <input type="text" inputMode="numeric" placeholder="YYYY" autoComplete="bday-year" />
          </label>

          <fieldset className="signup-gender">
            <legend>성별</legend>
            <div className="gender-options">
              <label>
                <input type="radio" name="gender" value="female" defaultChecked />
                <span>여성</span>
              </label>
              <label>
                <input type="radio" name="gender" value="male" />
                <span>남성</span>
              </label>
            </div>
          </fieldset>

          <label className="signup-field">
            <span>거주지</span>
            <input type="text" placeholder="거주지 주소를 입력해주세요" autoComplete="street-address" />
          </label>

          <button className="signup-submit" type="submit">
            다음 단계
          </button>
        </form>

        <p className="signup-login">
          이미 회원이신가요? <Link to="/login">로그인</Link>
        </p>
      </section>
    </main>
  )
}

export default Signup
