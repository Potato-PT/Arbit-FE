import { useAuthStatus } from './hooks/useAuthStatus'
import GuestHome from './features/home/pages/GuestHome'
import LoggedInHome from './features/home/pages/LoggedInHome'

function App() {
  const { isLoggedIn } = useAuthStatus()

  return isLoggedIn ? <LoggedInHome /> : <GuestHome />
}

export default App
