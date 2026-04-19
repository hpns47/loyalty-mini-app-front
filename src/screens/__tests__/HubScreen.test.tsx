import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HubScreen } from '../HubScreen'
import { mockTelegramWebApp, cleanupTelegramMock, mockFetchRoutes, jsonResponse } from '../../test-utils'

beforeEach(() => {
  mockTelegramWebApp()
  sessionStorage.clear()
})

afterEach(() => {
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

describe('HubScreen', () => {
  it('renders loading state initially', () => {
    mockFetchRoutes({
      '/api/v1/auth/me': () => new Promise(() => {}), // never resolves
    })
    render(<HubScreen />)
    // Loading skeleton is an animated div
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders welcome message with user name after auth', async () => {
    mockFetchRoutes({
      '/api/v1/auth/me': () =>
        jsonResponse({ user: { id: 'u1', telegram_id: 123456, first_name: 'Alice', username: 'alice' } }),
    })
    render(<HubScreen />)
    await waitFor(() => {
      expect(screen.getByText('Welcome, Alice')).toBeInTheDocument()
    })
  })

  it('renders "Guest" when auth fails', async () => {
    mockFetchRoutes({
      '/api/v1/auth/me': () => jsonResponse({ error: { code: 'UNAUTHORIZED' } }, 401),
    })
    render(<HubScreen />)
    await waitFor(() => {
      expect(screen.getByText('Welcome, Guest')).toBeInTheDocument()
    })
  })
})
