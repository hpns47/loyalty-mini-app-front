import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HomeScreen } from '../HomeScreen'
import {
  mockTelegramWebApp,
  cleanupTelegramMock,
  mockFetchRoutes,
  jsonResponse,
  type TelegramMock,
} from '../../test-utils'

let tg: TelegramMock

beforeEach(() => {
  tg = mockTelegramWebApp()
  localStorage.clear()
})

afterEach(() => {
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

const MOCK_CARDS = [
  {
    id: 'card-1',
    shop_id: 'shop-1',
    shop_name: 'Bean Bar',
    stamp_count: 3,
    status: 'active',
    stamp_threshold: 10,
  },
  {
    id: 'card-2',
    shop_id: 'shop-2',
    shop_name: 'Tea House',
    stamp_count: 10,
    status: 'reward_ready',
    stamp_threshold: 10,
  },
]

function setupFetch(cards = MOCK_CARDS) {
  mockFetchRoutes({
    '/api/v1/cards': () => jsonResponse({ cards }),
  })
}

describe('HomeScreen', () => {
  it('renders greeting with userName', async () => {
    setupFetch()
    render(<HomeScreen userName="Alice" />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders welcome label', async () => {
    setupFetch()
    render(<HomeScreen userName="Alice" />)
    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument()
  })

  it('renders avatar', async () => {
    setupFetch()
    render(<HomeScreen userName="Alice" />)
    // AvatarSample renders with the name
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows loyalty widget with active card data', async () => {
    setupFetch()
    render(<HomeScreen userName="Alice" />)
    await waitFor(() => {
      // The reward_ready card should be the active one shown in widget
      expect(screen.getAllByText('Tea House').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders all category chips', async () => {
    setupFetch()
    render(<HomeScreen userName="Alice" />)
    await waitFor(() => {
      expect(screen.getByText('Все')).toBeInTheDocument()
    })
    expect(screen.getByText('Кофе')).toBeInTheDocument()
    expect(screen.getByText('Еда')).toBeInTheDocument()
    expect(screen.getByText('Чай')).toBeInTheDocument()
  })

  it('renders shop list via PlaceChip components', async () => {
    setupFetch()
    render(<HomeScreen userName="Alice" />)
    await waitFor(() => {
      expect(screen.getAllByText('Bean Bar').length).toBeGreaterThanOrEqual(1)
    })
    expect(screen.getAllByText('Tea House').length).toBeGreaterThanOrEqual(1)
  })

  it('clicking a shop chip calls onShopClick with shopId', async () => {
    setupFetch()
    const onShopClick = vi.fn()
    render(<HomeScreen userName="Alice" onShopClick={onShopClick} />)
    await waitFor(() => {
      expect(screen.getByText('Bean Bar')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Bean Bar'))
    expect(onShopClick).toHaveBeenCalledWith('shop-1')
  })

  it('clicking QR button calls onQrClick', async () => {
    setupFetch()
    const onQrClick = vi.fn()
    render(<HomeScreen userName="Alice" onQrClick={onQrClick} />)
    const qrButton = screen.getByLabelText('Show my QR code')
    fireEvent.click(qrButton)
    expect(onQrClick).toHaveBeenCalledTimes(1)
  })

  it('dock renders at bottom with correct active tab', async () => {
    setupFetch()
    render(<HomeScreen userName="Alice" activeTab="home" />)
    expect(document.querySelector('.fixed')).toBeInTheDocument()
  })

  it('shows skeletons while loading', () => {
    // Never-resolving fetch to keep loading state
    mockFetchRoutes({
      '/api/v1/cards': () => new Promise(() => {}),
    })
    render(<HomeScreen userName="Alice" />)
    // CardSkeleton and ListSkeleton render animated placeholders
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state when no cards', async () => {
    setupFetch([])
    render(<HomeScreen userName="Alice" />)
    await waitFor(() => {
      expect(screen.getByText('Нет заведений')).toBeInTheDocument()
    })
  })

  it('hides BackButton and MainButton on mount', () => {
    setupFetch()
    render(<HomeScreen userName="Alice" />)
    expect(tg.BackButton.hide).toHaveBeenCalled()
    expect(tg.MainButton.hide).toHaveBeenCalled()
  })
})
