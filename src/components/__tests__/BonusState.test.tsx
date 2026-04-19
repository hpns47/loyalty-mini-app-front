import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BonusState } from '../BonusState'

describe('BonusState', () => {
  it('renders with aria-label showing state', () => {
    render(<BonusState state="default" />)
    expect(screen.getByLabelText('Stamp: default')).toBeInTheDocument()
  })

  it.each(['default', 'used', 'current', 'bonus'] as const)(
    'renders %s state without error',
    (state) => {
      const { container } = render(<BonusState state={state} />)
      expect(container.firstChild).toBeInTheDocument()
    },
  )

  it('applies stamp-pop animation when animated is true', () => {
    render(<BonusState state="current" animated />)
    const el = screen.getByLabelText('Stamp: current')
    expect(el.style.animation).toContain('stamp-pop')
  })

  it('does not apply animation when animated is false', () => {
    render(<BonusState state="current" />)
    const el = screen.getByLabelText('Stamp: current')
    expect(el.style.animation).toBe('')
  })
})
