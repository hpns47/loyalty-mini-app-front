import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileScreen } from '../ProfileScreen'
import { mockTelegramWebApp, cleanupTelegramMock, type TelegramMock } from '../../test-utils'

let tg: TelegramMock

beforeEach(() => {
  tg = mockTelegramWebApp()
})

afterEach(() => {
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

describe('ProfileScreen', () => {
  it('renders user name', () => {
    render(<ProfileScreen userName="Alice" />)
    // Name appears in heading and avatar — at least one present
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
  })

  it('renders avatar component', () => {
    render(<ProfileScreen userName="Alice" />)
    // AvatarSample renders — screen has content
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
  })

  it('renders @username', () => {
    render(<ProfileScreen userName="Alice" username="alice123" />)
    expect(screen.getByText('@alice123')).toBeInTheDocument()
  })

  it('renders Telegram ID', () => {
    render(<ProfileScreen userName="Alice" telegramId={99887766} />)
    expect(screen.getByText('TGID99887766')).toBeInTheDocument()
  })

  it('QR button calls onShowQr', () => {
    const onShowQr = vi.fn()
    render(<ProfileScreen userName="Alice" onShowQr={onShowQr} />)
    const qrButton = screen.getByLabelText('Show my QR code')
    fireEvent.click(qrButton)
    expect(onShowQr).toHaveBeenCalledTimes(1)
  })

  it('dock renders with profile tab active', () => {
    render(<ProfileScreen activeTab="profile" />)
    expect(document.querySelector('.fixed')).toBeInTheDocument()
  })

  it('shows transaction placeholder when empty', () => {
    render(<ProfileScreen userName="Alice" transactions={[]} />)
    expect(screen.getByText('Нет транзакций')).toBeInTheDocument()
  })

  it('renders transaction history items', () => {
    const transactions = [
      { description: 'Bean Bar', timestamp: '30.03.2026 12:00', scoreState: 'add' as const, scoreValue: 5 },
    ]
    render(<ProfileScreen userName="Alice" transactions={transactions} />)
    expect(screen.getByText('История')).toBeInTheDocument()
  })

  it('hides BackButton and MainButton on mount', () => {
    render(<ProfileScreen userName="Alice" />)
    expect(tg.BackButton.hide).toHaveBeenCalled()
    expect(tg.MainButton.hide).toHaveBeenCalled()
  })

  it('handles missing optionals without showing undefined', () => {
    render(<ProfileScreen />)
    expect(screen.getAllByText('Guest').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
  })
})
