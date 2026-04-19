import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoyaltyCard } from '../LoyaltyCard'

describe('LoyaltyCard', () => {
  it('waiting state: shows remaining stamps count', () => {
    render(<LoyaltyCard state="waiting" shopName="Bean Bar" stampsRemaining={7} />)
    expect(screen.getByText('До бесплатного бонуса осталось')).toBeInTheDocument()
    expect(screen.getByText('7 кофе')).toBeInTheDocument()
  })

  it('bonusEarned state: shows free coffee message', () => {
    render(<LoyaltyCard state="bonusEarned" shopName="Bean Bar" />)
    expect(screen.getByText('Вам доступен бесплатный')).toBeInTheDocument()
    expect(screen.getByText('1 кофе на выбор')).toBeInTheDocument()
  })

  it('noPurchases state: shows "add shop" message', () => {
    render(<LoyaltyCard state="noPurchases" />)
    expect(screen.getByText('Вы ещё не состоите в программе лояльности')).toBeInTheDocument()
    expect(screen.getByText('Добавить заведение')).toBeInTheDocument()
  })

  it('renders shop name when provided', () => {
    render(<LoyaltyCard state="waiting" shopName="Bean Bar" stampsRemaining={5} />)
    expect(screen.getByText('Bean Bar')).toBeInTheDocument()
  })

  it('does not render shop name when not provided', () => {
    render(<LoyaltyCard state="noPurchases" />)
    expect(screen.queryByText('Bean Bar')).not.toBeInTheDocument()
  })
})
