import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { IconButton } from '../IconButton'

describe('IconButton', () => {
  it('renders with default aria-label for each icon type', () => {
    const { rerender } = render(<IconButton icon="QR" />)
    expect(screen.getByLabelText('Show QR code')).toBeInTheDocument()

    rerender(<IconButton icon="Back" />)
    expect(screen.getByLabelText('Go back')).toBeInTheDocument()

    rerender(<IconButton icon="Home" />)
    expect(screen.getByLabelText('Home')).toBeInTheDocument()

    rerender(<IconButton icon="user" />)
    expect(screen.getByLabelText('Profile')).toBeInTheDocument()
  })

  it('uses custom aria-label when provided', () => {
    render(<IconButton icon="QR" aria-label="Custom label" />)
    expect(screen.getByLabelText('Custom label')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton icon="Home" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton icon="Home" onClick={onClick} disabled />)
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('pressed=true sets aria-pressed and changes background', () => {
    render(<IconButton icon="Home" pressed />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn).toHaveStyle({ backgroundColor: '#c9cfd8' })
  })

  it('pressed=false sets aria-pressed=false and white background', () => {
    render(<IconButton icon="Home" pressed={false} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    expect(btn).toHaveStyle({ backgroundColor: '#ffffff' })
  })

  it('renders an SVG icon inside the button', () => {
    render(<IconButton icon="flash" />)
    const btn = screen.getByRole('button')
    expect(btn.querySelector('svg')).toBeInTheDocument()
  })
})
