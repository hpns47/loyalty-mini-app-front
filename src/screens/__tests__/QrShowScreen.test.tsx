import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { QrShowScreen } from '../QrShowScreen'
import {
  mockTelegramWebApp,
  cleanupTelegramMock,
  jsonResponse,
  type TelegramMock,
} from '../../test-utils'

let tg: TelegramMock

beforeEach(() => {
  tg = mockTelegramWebApp()
})

afterEach(() => {
  cleanup()
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

const QR_RESPONSE = {
  qrDataUrl: 'data:image/png;base64,fakeQrData',
  expiresAt: Math.floor(Date.now() / 1000) + 60,
}

function setupFetch(response = QR_RESPONSE) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => jsonResponse(response)),
  )
}

describe('QrShowScreen', () => {
  it('shows QR code image when loaded', async () => {
    setupFetch()
    render(<QrShowScreen userName="Alice" />)
    await waitFor(() => {
      const img = document.querySelector('img')
      expect(img).toBeInTheDocument()
    })
  })

  it('shows countdown timer', async () => {
    setupFetch()
    render(<QrShowScreen userName="Alice" />)
    await waitFor(() => {
      expect(screen.getByText(/Обновится через \d+с/)).toBeInTheDocument()
    })
  })

  it('timer decrements every second', async () => {
    setupFetch()
    const { unmount } = render(<QrShowScreen userName="Alice" />)

    await waitFor(() => {
      expect(screen.getByText(/Обновится через/)).toBeInTheDocument()
    })

    const initialText = screen.getByText(/Обновится через \d+с/).textContent
    // Wait 2 seconds for countdown to decrement
    await new Promise((r) => setTimeout(r, 2100))

    const updatedText = screen.getByText(/Обновится через \d+с/).textContent
    expect(updatedText).not.toBe(initialText)
    unmount()
  }, 10000)

  it('shows instruction text', () => {
    setupFetch()
    render(<QrShowScreen userName="Alice" />)
    expect(
      screen.getByText('Предъявите QR-код кассиру для получения бонусов'),
    ).toBeInTheDocument()
  })

  it('configures MainButton with correct text', () => {
    setupFetch()
    render(<QrShowScreen userName="Alice" />)
    expect(tg.MainButton.setText).toHaveBeenCalledWith('Показать кассиру')
    expect(tg.MainButton.disable).toHaveBeenCalled()
    expect(tg.MainButton.show).toHaveBeenCalled()
  })

  it('shows loading text when QR is not ready', () => {
    // Never resolving fetch
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    render(<QrShowScreen userName="Alice" />)
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  it('shows unavailable text when QR fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ error: { code: 'QR_FETCH_FAILED' } }, 500)),
    )
    const { unmount } = render(<QrShowScreen userName="Alice" />)
    await waitFor(() => {
      expect(screen.getByText('QR не доступен')).toBeInTheDocument()
    })
    unmount()
  })

  it('cleans up MainButton on unmount', () => {
    setupFetch()
    const { unmount } = render(<QrShowScreen userName="Alice" />)
    unmount()
    expect(tg.MainButton.hide).toHaveBeenCalled()
  })
})
