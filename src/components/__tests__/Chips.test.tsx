import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Chips } from '../Chips'

describe('Chips', () => {
  it('renders label text', () => {
    render(<Chips label="Coffee" />)
    expect(screen.getByText('Coffee')).toBeInTheDocument()
  })

  it('renders as a button', () => {
    render(<Chips label="Tea" />)
    expect(screen.getByRole('button', { name: 'Tea' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Chips label="Click me" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('focused=true adds visible border', () => {
    render(<Chips label="Active" focused />)
    const btn = screen.getByRole('button')
    expect(btn.style.border).not.toContain('transparent')
  })

  it('focused=false has transparent border', () => {
    render(<Chips label="Inactive" focused={false} />)
    const btn = screen.getByRole('button')
    expect(btn.style.border).toContain('transparent')
  })
})
