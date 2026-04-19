import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock is hoisted — all mocks must live inside the factory.
// We capture the per-instance methods via module-level vars that vi.hoisted exposes.
const { mockStart, mockStop, mockClear } = vi.hoisted(() => ({
  mockStart: vi.fn().mockResolvedValue(undefined),
  mockStop: vi.fn().mockResolvedValue(undefined),
  mockClear: vi.fn(),
}))

vi.mock('html5-qrcode', () => {
  class Html5Qrcode {
    isScanning = false
    start(...args: unknown[]) { return mockStart(...args) }
    stop(...args: unknown[]) { return mockStop(...args) }
    clear(...args: unknown[]) { return mockClear(...args) }
  }
  return { Html5Qrcode }
})

import { CashierScanner } from '../CashierScanner'

describe('CashierScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStart.mockResolvedValue(undefined)
    mockStop.mockResolvedValue(undefined)
  })

  it('renders the scanner container element', () => {
    const onScan = vi.fn()
    const { container } = render(<CashierScanner onScan={onScan} />)
    expect(container.querySelector('#cashier-reader')).toBeTruthy()
  })

  it('initializes Html5Qrcode scanner on mount', async () => {
    render(<CashierScanner onScan={vi.fn()} />)
    expect(mockStart).toHaveBeenCalled()
  })

  it('calls onScan when QR is detected', async () => {
    const onScan = vi.fn()
    mockStart.mockImplementation(
      (_camera: unknown, _config: unknown, onSuccess: (text: string) => void) => {
        setTimeout(() => onSuccess('test-qr-token'), 0)
        return Promise.resolve()
      },
    )

    render(<CashierScanner onScan={onScan} />)

    await vi.waitFor(() => {
      expect(onScan).toHaveBeenCalledWith('test-qr-token')
    })
  })
})
