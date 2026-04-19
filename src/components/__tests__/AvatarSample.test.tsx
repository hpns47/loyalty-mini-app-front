import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AvatarSample } from '../AvatarSample'

describe('AvatarSample', () => {
  it('renders img when src is provided', () => {
    render(<AvatarSample src="https://example.com/photo.jpg" name="John Doe" />)
    const img = screen.getByRole('img', { name: 'John Doe' })
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders initials fallback when no src', () => {
    render(<AvatarSample name="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders single initial for single-word name', () => {
    render(<AvatarSample name="Alice" />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders "?" when no name and no src', () => {
    render(<AvatarSample />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('applies custom size', () => {
    render(<AvatarSample name="Test" size={64} />)
    const el = screen.getByLabelText('Test')
    expect(el.style.width).toBe('64px')
    expect(el.style.height).toBe('64px')
  })

  it('defaults to 44px size', () => {
    render(<AvatarSample name="Test" size={44} />)
    const el = screen.getByLabelText('Test')
    expect(el.style.width).toBe('44px')
    expect(el.style.height).toBe('44px')
  })
})
