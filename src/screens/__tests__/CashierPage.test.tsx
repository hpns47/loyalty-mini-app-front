import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { CashierPage } from '../CashierPage'
import {
  mockTelegramWebApp,
  cleanupTelegramMock,
  jsonResponse,
} from '../../test-utils'

// Capture the onScan callback by mocking CashierScanner
let capturedOnScan: ((data: string) => void) | null = null
vi.mock('../../components/CashierScanner', () => ({
  CashierScanner: ({ onScan }: { onScan: (data: string) => void }) => {
    capturedOnScan = onScan
    return <div data-testid="mock-scanner">Scanner Ready</div>
  },
}))

function setLocationSearch(params: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search: params },
    writable: true,
    configurable: true,
  })
}

beforeEach(() => {
  mockTelegramWebApp()
  capturedOnScan = null
})

afterEach(() => {
  cleanup()
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

// Valid JWT token with sub claim for userId
const FAKE_QR_TOKEN = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: 'user-123' }))}.sig`

describe('CashierPage', () => {
  it('shows loading spinner in validating state', () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<CashierPage />)
    expect(screen.getByText('Checking cashier credentials…')).toBeInTheDocument()
  })

  it('shows invalid state when credentials are wrong', async () => {
    setLocationSearch('?shop=bean-bar&key=wrong')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ valid: false, shopId: null })),
    )
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByText('Invalid cashier key or shop not found')).toBeInTheDocument()
    })
  })

  it('shows scanning state when credentials are valid', async () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ valid: true, shopId: 'shop-1' })),
    )
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByText('Scan customer QR code')).toBeInTheDocument()
    })
  })

  it('shows stamp_success after successful scan', async () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    let fetchCall = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        fetchCall++
        if (fetchCall === 1) return jsonResponse({ valid: true, shopId: 'shop-1' })
        return jsonResponse({
          stamp: { newStampCount: 4, isRewardReady: false, userName: 'Bob' },
        })
      }),
    )
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByTestId('mock-scanner')).toBeInTheDocument()
    })

    // Trigger scan via captured callback
    capturedOnScan!(FAKE_QR_TOKEN)
    await waitFor(() => {
      expect(screen.getByText(/Stamp added for Bob/)).toBeInTheDocument()
    })
    expect(screen.getByText('4/10 stamps')).toBeInTheDocument()
  })

  it('shows qr_used on 409 response', async () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    let fetchCall = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        fetchCall++
        if (fetchCall === 1) return jsonResponse({ valid: true, shopId: 'shop-1' })
        return jsonResponse({ error: { code: 'QR_USED' } }, 409)
      }),
    )
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByTestId('mock-scanner')).toBeInTheDocument()
    })

    capturedOnScan!(FAKE_QR_TOKEN)
    await waitFor(() => {
      expect(screen.getByText('QR already scanned')).toBeInTheDocument()
    })
  })

  it('shows reward_ready with Redeem button', async () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    let fetchCall = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        fetchCall++
        if (fetchCall === 1) return jsonResponse({ valid: true, shopId: 'shop-1' })
        // All subsequent calls return reward_ready stamp
        return jsonResponse({
          stamp: { newStampCount: 10, isRewardReady: true, userName: 'Bob' },
        })
      }),
    )
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByTestId('mock-scanner')).toBeInTheDocument()
    })

    capturedOnScan!(FAKE_QR_TOKEN)
    await waitFor(() => {
      expect(screen.getByText(/Bob has a free coffee/)).toBeInTheDocument()
    })
    expect(screen.getByText('Redeem Free Coffee')).toBeInTheDocument()
  })

  it('Redeem button resets to scanning', async () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    let fetchCall = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        fetchCall++
        if (fetchCall === 1) return jsonResponse({ valid: true, shopId: 'shop-1' })
        if (fetchCall === 2) {
          return jsonResponse({
            stamp: { newStampCount: 10, isRewardReady: true, userName: 'Bob' },
          })
        }
        // Redeem call
        return jsonResponse({ success: true })
      }),
    )
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByTestId('mock-scanner')).toBeInTheDocument()
    })

    capturedOnScan!(FAKE_QR_TOKEN)
    await waitFor(() => {
      expect(screen.getByText('Redeem Free Coffee')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Redeem Free Coffee'))
    await waitFor(() => {
      expect(screen.getByText('Scan customer QR code')).toBeInTheDocument()
    })
  })

  it('shows invalid state with missing URL params', async () => {
    setLocationSearch('')
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByText('Invalid cashier key or shop not found')).toBeInTheDocument()
    })
  })

  it('shows invalid state with only shop param', async () => {
    setLocationSearch('?shop=bean-bar')
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByText('Invalid cashier key or shop not found')).toBeInTheDocument()
    })
  })

  it('renders Cashier Scanner header', () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<CashierPage />)
    expect(screen.getByText('Cashier Scanner')).toBeInTheDocument()
  })

  it('shows invalid on network error during validation', async () => {
    setLocationSearch('?shop=bean-bar&key=secret123')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => { throw new Error('network') }),
    )
    render(<CashierPage />)
    await waitFor(() => {
      expect(screen.getByText('Invalid cashier key or shop not found')).toBeInTheDocument()
    })
  })
})
