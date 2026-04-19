import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SalesRow } from '../SalesRow'

describe('SalesRow', () => {
  it('renders description text', () => {
    render(
      <SalesRow
        description="Получение бонуса"
        timestamp="01.01.2026 18:45"
        scoreState="add"
        scoreValue={1}
      />,
    )
    expect(screen.getByText('Получение бонуса')).toBeInTheDocument()
  })

  it('renders timestamp', () => {
    render(
      <SalesRow
        description="Test"
        timestamp="15.03.2026 12:00"
        scoreState="remove"
        scoreValue={2}
      />,
    )
    expect(screen.getByText('15.03.2026 12:00')).toBeInTheDocument()
  })

  it('renders Score badge with add state', () => {
    render(
      <SalesRow description="Test" timestamp="now" scoreState="add" scoreValue={3} />,
    )
    expect(screen.getByText('+3')).toBeInTheDocument()
  })

  it('renders Score badge with remove state', () => {
    render(
      <SalesRow description="Test" timestamp="now" scoreState="remove" scoreValue={1} />,
    )
    expect(screen.getByText('−1')).toBeInTheDocument()
  })
})
