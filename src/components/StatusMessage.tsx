import type { ReactNode } from 'react'
import './StatusMessage.css'

type StatusMessageTone = 'default' | 'error'

type StatusMessageProps = {
  children: ReactNode
  className?: string
  role?: 'status' | 'alert'
  tone?: StatusMessageTone
}

function StatusMessage({
  children,
  className = '',
  role = 'status',
  tone = 'default',
}: StatusMessageProps) {
  const classNames = [
    'status-message',
    tone === 'error' ? 'is-error' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} role={role}>
      {children}
    </div>
  )
}

export default StatusMessage
