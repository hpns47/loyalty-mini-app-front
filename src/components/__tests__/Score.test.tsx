import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Score } from '../Score'

describe('Score', () => {
  it('renders "+N" for add state', () => {
    render(<Score state="add" value={3} />)
    expect(screen.getByText('+3')).toBeInTheDocument()
  })

  it('renders "−N" for remove state (uses minus sign, not hyphen)', () => {
    render(<Score state="remove" value={2} />)
    expect(screen.getByText('−2')).toBeInTheDocument()
  })

  it('has aria-label with score value', () => {
    render(<Score state="add" value={1} />)
    expect(screen.getByLabelText('Score: +1')).toBeInTheDocument()
  })

  it('uses absolute value for negative inputs', () => {
    render(<Score state="remove" value={-5} />)
    expect(screen.getByText('−5')).toBeInTheDocument()
  })
})
