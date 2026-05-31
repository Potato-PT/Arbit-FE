import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuthStatus } from '../hooks/useAuthStatus'
import './AppHeader.css'

type AppHeaderVariant = 'default' | 'home' | 'warm'

type SectionLink = {
  label: string
  to: string
  isActive?: boolean
}

type AppHeaderProps = {
  variant?: AppHeaderVariant
  sectionLinks?: SectionLink[]
  showAccountLabel?: boolean
  onBrandClick?: () => void
}

function AppHeader({
  variant = 'default',
  sectionLinks = [],
  showAccountLabel = false,
  onBrandClick,
}: AppHeaderProps) {
  const { accountLabel, accountPath } = useAuthStatus()
  const className = ['app-header', `app-header-${variant}`].join(' ')

  return (
    <header className={className}>
      <Link
        className="app-header-brand"
        to="/"
        aria-label="Arbit home"
        onClick={onBrandClick
          ? (event) => {
              event.preventDefault()
              onBrandClick()
            }
          : undefined}
      >
        <img src={logo} alt="Arbit" />
      </Link>

      {sectionLinks.length > 0 && (
        <nav className="app-header-section-nav" aria-label="Sections">
          {sectionLinks.map((link) => (
            <Link className={link.isActive ? 'is-active' : ''} key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <nav className="app-header-actions" aria-label="Primary">
        <Link to="/exhibitions/search" aria-label="검색">
          <SearchIcon />
        </Link>
        <Link to={accountPath} aria-label={accountLabel}>
          <UserIcon />
          {showAccountLabel && <span>{accountLabel}</span>}
        </Link>
      </nav>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.6" cy="10.6" r="5.7" />
      <path d="m15 15 4.2 4.2" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.3" r="3" />
      <path d="M7.1 17.2c.85-2.45 2.48-3.68 4.9-3.68s4.05 1.23 4.9 3.68" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export default AppHeader
