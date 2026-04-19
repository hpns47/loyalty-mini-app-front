import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoyaltyWidget } from '../LoyaltyWidget'

describe('LoyaltyWidget', () => {
  it('renders 10 stamp segments by default', () => {
    const { container } = render(<LoyaltyWidget />)
    const stamps = container.querySelectorAll('[aria-label^="Stamp:"]')
    expect(stamps).toHaveLength(10)
  })

  it('renders custom totalStamps count', () => {
    const { container } = render(<LoyaltyWidget totalStamps={8} />)
    const stamps = container.querySelectorAll('[aria-label^="Stamp:"]')
    expect(stamps).toHaveLength(8)
  })

  it('stampCount=0: all stamps default, shows noPurchases card', () => {
    render(<LoyaltyWidget stampsCollected={0} />)
    expect(screen.getByText('Вы ещё не состоите в программе лояльности')).toBeInTheDocument()
    expect(screen.getByLabelText('Coffee stamp')).toBeInTheDocument()
  })

  it('stampCount=10 (full): shows bonusEarned card and gift icon', () => {
    render(<LoyaltyWidget stampsCollected={10} shopName="Bean Bar" />)
    expect(screen.getByText('Вам доступен бесплатный')).toBeInTheDocument()
    expect(screen.getByLabelText('Bonus earned')).toBeInTheDocument()
  })

  it('partial stamps: shows waiting card with remaining count', () => {
    render(<LoyaltyWidget stampsCollected={3} shopName="Bean Bar" />)
    expect(screen.getByText('До бесплатного бонуса осталось')).toBeInTheDocument()
    expect(screen.getByText('7 кофе')).toBeInTheDocument()
  })

  it('shows shop name on the card', () => {
    render(<LoyaltyWidget stampsCollected={5} shopName="Bean Bar" />)
    expect(screen.getByText('Bean Bar')).toBeInTheDocument()
  })

  it('newlyFilledIndex triggers animation on that stamp', () => {
    const { container } = render(
      <LoyaltyWidget stampsCollected={3} newlyFilledIndex={2} />,
    )
    const stamps = container.querySelectorAll('[aria-label^="Stamp:"]')
    expect((stamps[2] as HTMLElement).style.animation).toContain('stamp-pop')
    expect((stamps[0] as HTMLElement).style.animation).toBe('')
    expect((stamps[1] as HTMLElement).style.animation).toBe('')
  })
})
