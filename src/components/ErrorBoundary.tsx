import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-6"
          style={{ backgroundColor: 'var(--tg-theme-bg-color, #ffffff)' }}
        >
          <p
            className="text-lg font-semibold"
            style={{ color: 'var(--tg-theme-text-color, #0E121B)' }}
          >
            Something went wrong
          </p>
          <p
            className="text-sm text-center"
            style={{ color: 'var(--tg-theme-hint-color, #99A0AE)' }}
          >
            An unexpected error occurred
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95"
            style={{ backgroundColor: 'var(--tg-theme-button-color, #3390EC)' }}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
