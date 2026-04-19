import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Dock } from '../Dock'

describe('Dock', () => {
  it('renders 3 tab buttons (Home, Scan, Profile)', () => {
    render(<Dock />)
    expect(screen.getByLabelText('Home')).toBeInTheDocument()
    expect(screen.getByLabelText('Scan')).toBeInTheDocument()
    expect(screen.getByLabelText('Profile')).toBeInTheDocument()
  })

  it('renders navigation landmark', () => {
    render(<Dock />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('active tab has aria-pressed=true', () => {
    render(<Dock activeTab="scan" />)
    expect(screen.getByLabelText('Scan')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Home')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByLabelText('Profile')).toHaveAttribute('aria-pressed', 'false')
  })

  it('defaults to home tab active', () => {
    render(<Dock />)
    expect(screen.getByLabelText('Home')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onTabChange with correct tab when clicked', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<Dock onTabChange={onTabChange} />)

    await user.click(screen.getByLabelText('Scan'))
    expect(onTabChange).toHaveBeenCalledWith('scan')

    await user.click(screen.getByLabelText('Profile'))
    expect(onTabChange).toHaveBeenCalledWith('profile')

    await user.click(screen.getByLabelText('Home'))
    expect(onTabChange).toHaveBeenCalledWith('home')
  })

  it('all tabs are keyboard-accessible via Enter/Space', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<Dock onTabChange={onTabChange} />)

    screen.getByLabelText('Scan').focus()
    await user.keyboard('{Enter}')
    expect(onTabChange).toHaveBeenCalledWith('scan')

    screen.getByLabelText('Profile').focus()
    await user.keyboard(' ')
    expect(onTabChange).toHaveBeenCalledWith('profile')
  })
})
