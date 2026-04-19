import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CardSkeleton, ListSkeleton } from '../Skeleton'

describe('CardSkeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<CardSkeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('renders 10 stamp placeholder bars', () => {
    const { container } = render(<CardSkeleton />)
    const bars = container.querySelectorAll('.h-1')
    expect(bars).toHaveLength(10)
  })
})

describe('ListSkeleton', () => {
  it('renders 3 placeholder cards by default', () => {
    const { container } = render(<ListSkeleton />)
    const cards = container.querySelectorAll('.animate-pulse')
    expect(cards).toHaveLength(3)
  })

  it('renders custom count of placeholder cards', () => {
    const { container } = render(<ListSkeleton count={5} />)
    const cards = container.querySelectorAll('.animate-pulse')
    expect(cards).toHaveLength(5)
  })
})
