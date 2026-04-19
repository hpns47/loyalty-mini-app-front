import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { mockTelegramWebApp, cleanupTelegramMock, type TelegramMock } from '../test-utils'
import { useAuth } from '../hooks/useAuth'
import { useDeepLink } from '../hooks/useDeepLink'

// ---------------------------------------------------------------------------
// Mock hooks
// ---------------------------------------------------------------------------
vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../hooks/useDeepLink', () => ({ useDeepLink: vi.fn() }))

// ---------------------------------------------------------------------------
// Mock screens — each stub exposes callback props via buttons so tests can
// trigger state-machine transitions without rendering real screen internals.
// ---------------------------------------------------------------------------
vi.mock('../screens/HomeScreen', () => ({
  HomeScreen: (props: any) => (
    <div data-testid="home-screen" data-username={props.userName ?? ''}>
      <button data-testid="tab-profile" onClick={() => props.onTabChange('profile')} />
      <button data-testid="tab-scan" onClick={() => props.onTabChange('scan')} />
      <button data-testid="shop-click" onClick={() => props.onShopClick('shop-123')} />
      <button data-testid="qr-click" onClick={() => props.onQrClick()} />
    </div>
  ),
}))

vi.mock('../screens/LoyaltyCardScreen', () => ({
  LoyaltyCardScreen: (props: any) => (
    <div data-testid="loyalty-card-screen" data-shop-id={props.shopId}>
      <button data-testid="loyalty-back" onClick={props.onBack} />
    </div>
  ),
}))

vi.mock('../screens/ProfileScreen', () => ({
  ProfileScreen: (props: any) => (
    <div data-testid="profile-screen" data-username={props.userName ?? ''}>
      <button data-testid="profile-show-qr" onClick={props.onShowQr} />
      <button data-testid="profile-tab-home" onClick={() => props.onTabChange('home')} />
    </div>
  ),
}))

vi.mock('../screens/QrScanScreen', () => ({
  QrScanScreen: (props: any) => (
    <div data-testid="qr-scan-screen">
      <button data-testid="scan-back" onClick={props.onBack} />
      <button data-testid="scan-tab-home" onClick={() => props.onTabChange('home')} />
    </div>
  ),
}))

vi.mock('../screens/QrShowScreen', () => ({
  QrShowScreen: (props: any) => (
    <div data-testid="qr-show-screen">
      <button data-testid="qrshow-back" onClick={props.onBack} />
    </div>
  ),
}))

vi.mock('../screens/CashierPage', () => ({
  CashierPage: () => <div data-testid="cashier-page" />,
}))

// ErrorBoundary — passthrough by default; one test uses the real component
vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>
const mockUseDeepLink = useDeepLink as ReturnType<typeof vi.fn>

function setPathname(path: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, pathname: path },
    writable: true,
    configurable: true,
  })
}

// We import App lazily so mocks are installed first
async function importApp() {
  const mod = await import('../App')
  return mod.default
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
let tg: TelegramMock

beforeEach(() => {
  tg = mockTelegramWebApp()
  mockUseAuth.mockReturnValue({ user: { id: 'u1', telegram_id: 123456, first_name: 'Test', username: 'testuser' }, loading: false, error: null })
  mockUseDeepLink.mockReturnValue({ shopId: null })
  setPathname('/')
})

afterEach(() => {
  cleanup()
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('App', () => {
  // ---- Telegram SDK init ----
  describe('Telegram SDK init', () => {
    it('calls tg.ready() and tg.expand() on mount', async () => {
      const App = await importApp()
      render(<App />)
      expect(tg.ready).toHaveBeenCalled()
      expect(tg.expand).toHaveBeenCalled()
    })
  })

  // ---- Auth states ----
  describe('auth states', () => {
    it('shows loading skeleton when auth is loading', async () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true, error: null })
      const App = await importApp()
      const { container } = render(<App />)
      expect(container.querySelector('.animate-pulse')).not.toBeNull()
      expect(screen.queryByTestId('home-screen')).toBeNull()
    })

    it('renders HomeScreen with null user on auth failure (graceful degradation)', async () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false, error: 'Auth failed' })
      const App = await importApp()
      render(<App />)
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    })
  })

  // ---- Cashier route ----
  describe('cashier route', () => {
    it('renders CashierPage when pathname is /cashier', async () => {
      setPathname('/cashier')
      const App = await importApp()
      render(<App />)
      expect(screen.getByTestId('cashier-page')).toBeInTheDocument()
      expect(screen.queryByTestId('home-screen')).toBeNull()
    })
  })

  // ---- Default & tab navigation ----
  describe('screen routing', () => {
    it('renders HomeScreen by default', async () => {
      const App = await importApp()
      render(<App />)
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    })

    it('switches to ProfileScreen on profile tab', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('tab-profile'))
      expect(screen.getByTestId('profile-screen')).toBeInTheDocument()
      expect(screen.queryByTestId('home-screen')).toBeNull()
    })

    it('switches to QrScanScreen on scan tab', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('tab-scan'))
      expect(screen.getByTestId('qr-scan-screen')).toBeInTheDocument()
    })

    it('switches to LoyaltyCardScreen on shop click with correct shopId', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('shop-click'))
      const card = screen.getByTestId('loyalty-card-screen')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('data-shop-id', 'shop-123')
    })

    it('switches to QrShowScreen on QR button click', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('qr-click'))
      expect(screen.getByTestId('qr-show-screen')).toBeInTheDocument()
    })

    it('switches to QrShowScreen from ProfileScreen via onShowQr', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('tab-profile'))
      fireEvent.click(screen.getByTestId('profile-show-qr'))
      expect(screen.getByTestId('qr-show-screen')).toBeInTheDocument()
    })
  })

  // ---- Deep link handling ----
  describe('deep link handling', () => {
    it('renders LoyaltyCardScreen when deep link shopId is present', async () => {
      mockUseDeepLink.mockReturnValue({ shopId: 'deep-link-shop-id' })
      const App = await importApp()
      render(<App />)
      const card = screen.getByTestId('loyalty-card-screen')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('data-shop-id', 'deep-link-shop-id')
      expect(screen.queryByTestId('home-screen')).toBeNull()
    })

    it('renders HomeScreen when deep link shopId is null', async () => {
      mockUseDeepLink.mockReturnValue({ shopId: null })
      const App = await importApp()
      render(<App />)
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    })

    it('does not re-show deep link card after dismissal', async () => {
      mockUseDeepLink.mockReturnValue({ shopId: 'deep-link-shop-id' })
      const App = await importApp()
      render(<App />)
      // Dismiss the deep-link card
      fireEvent.click(screen.getByTestId('loyalty-back'))
      // Should now show HomeScreen, not the deep-link card
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
      expect(screen.queryByTestId('loyalty-card-screen')).toBeNull()
    })
  })

  // ---- Back navigation ----
  describe('back navigation', () => {
    it('navigates from LoyaltyCardScreen back to HomeScreen', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('shop-click'))
      expect(screen.getByTestId('loyalty-card-screen')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('loyalty-back'))
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    })

    it('navigates from QrShowScreen back to HomeScreen', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('qr-click'))
      expect(screen.getByTestId('qr-show-screen')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('qrshow-back'))
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    })

    it('navigates from QrScanScreen back to HomeScreen via tab', async () => {
      const App = await importApp()
      render(<App />)
      fireEvent.click(screen.getByTestId('tab-scan'))
      expect(screen.getByTestId('qr-scan-screen')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('scan-tab-home'))
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    })
  })

  // ---- Error boundary ----
  describe('error boundary', () => {
    it('catches child screen errors and shows fallback', async () => {
      // Restore real ErrorBoundary for this test
      const { ErrorBoundary } = await vi.importActual<typeof import('../components/ErrorBoundary')>('../components/ErrorBoundary')

      // Override the HomeScreen mock to throw
      const ThrowingScreen = () => {
        throw new Error('Screen crash')
      }

      // Suppress React error boundary console.error noise
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary key="home">
          <ThrowingScreen />
        </ErrorBoundary>,
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      spy.mockRestore()
    })
  })
})
