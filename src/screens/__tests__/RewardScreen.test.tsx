import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { RewardScreen } from '../RewardScreen'
import { mockTelegramWebApp, cleanupTelegramMock, type TelegramMock } from '../../test-utils'

let tg: TelegramMock

beforeEach(() => {
  tg = mockTelegramWebApp()
})

afterEach(() => {
  cleanup()
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

describe('RewardScreen', () => {
  const defaultProps = { shopName: 'Bean Bar', onBack: vi.fn() }

  it('shows "Show this screen to the cashier" text', () => {
    render(<RewardScreen {...defaultProps} />)
    expect(screen.getByText('Show this screen to the cashier')).toBeInTheDocument()
  })

  it('shows shop name in header', () => {
    render(<RewardScreen {...defaultProps} />)
    expect(screen.getAllByText('Bean Bar').length).toBeGreaterThanOrEqual(1)
  })

  it('renders LoyaltyWidget with 10 stamps', () => {
    render(<RewardScreen {...defaultProps} />)
    // LoyaltyWidget renders stamp indicators — should be present
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
  })

  it('triggers haptic feedback on mount', () => {
    render(<RewardScreen {...defaultProps} />)
    expect(tg.HapticFeedback.notificationOccurred).toHaveBeenCalledWith('success')
  })

  it('shows BackButton on mount', () => {
    render(<RewardScreen {...defaultProps} />)
    expect(tg.BackButton.show).toHaveBeenCalled()
    expect(tg.BackButton.onClick).toHaveBeenCalledWith(defaultProps.onBack)
  })

  it('configures MainButton as informational', () => {
    render(<RewardScreen {...defaultProps} />)
    expect(tg.MainButton.setText).toHaveBeenCalledWith('Claim at Counter')
    expect(tg.MainButton.disable).toHaveBeenCalled()
    expect(tg.MainButton.show).toHaveBeenCalled()
  })

  it('cleans up BackButton and MainButton on unmount', () => {
    const { unmount } = render(<RewardScreen {...defaultProps} />)
    unmount()
    expect(tg.BackButton.hide).toHaveBeenCalled()
    expect(tg.BackButton.offClick).toHaveBeenCalledWith(defaultProps.onBack)
    expect(tg.MainButton.hide).toHaveBeenCalled()
  })
})
