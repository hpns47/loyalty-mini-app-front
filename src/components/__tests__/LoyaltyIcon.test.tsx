import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoyaltyIcon } from '../LoyaltyIcon'

describe('LoyaltyIcon', () => {
  it('renders coffee variant with default aria-label', () => {
    render(<LoyaltyIcon icon="coffee" />)
    expect(screen.getByLabelText('Coffee')).toBeInTheDocument()
  })

  it('renders gift variant with default aria-label', () => {
    render(<LoyaltyIcon icon="gift" />)
    expect(screen.getByLabelText('Gift')).toBeInTheDocument()
  })

  it('uses custom label when provided', () => {
    render(<LoyaltyIcon icon="coffee" label="Stamp icon" />)
    expect(screen.getByLabelText('Stamp icon')).toBeInTheDocument()
  })

  it('renders as an SVG with role="img"', () => {
    render(<LoyaltyIcon icon="coffee" />)
    const svg = screen.getByRole('img', { name: 'Coffee' })
    expect(svg.tagName.toLowerCase()).toBe('svg')
  })
})
