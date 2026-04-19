import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PlaceChip } from '../PlaceChip'

describe('PlaceChip', () => {
  it('renders shop name as accessible label', () => {
    render(<PlaceChip name="Bean Bar" />)
    expect(screen.getByLabelText('Bean Bar')).toBeInTheDocument()
  })

  it('renders shop name text', () => {
    render(<PlaceChip name="Bean Bar" />)
    expect(screen.getByText('Bean Bar')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<PlaceChip name="Bean Bar" onClick={onClick} />)
    await user.click(screen.getByLabelText('Bean Bar'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders background image when photoUrl provided', () => {
    const { container } = render(<PlaceChip name="Test" photoUrl="https://example.com/photo.jpg" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders category chip when category provided', () => {
    render(<PlaceChip name="Test" category="coffee" />)
    expect(screen.getByText('coffee')).toBeInTheDocument()
  })

  it('does not render category chip when not provided', () => {
    render(<PlaceChip name="Test" />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })
})
