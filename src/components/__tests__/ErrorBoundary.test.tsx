import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test explosion')
  return <p>Child content</p>
}

// React's development mode uses invokeGuardedCallbackDev which dispatches
// a synthetic error event on window so devtools can show original stack.
// jsdom re-throws these events — we must preventDefault() them.
function suppressReactErrorEventHandler(e: ErrorEvent) {
  if (e.message?.includes('Test explosion')) {
    e.preventDefault()
  }
}

describe('ErrorBoundary', () => {
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
    window.addEventListener('error', suppressReactErrorEventHandler)
  })
  afterEach(() => {
    console.error = originalError
    window.removeEventListener('error', suppressReactErrorEventHandler)
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('catches error and renders fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
  })

  it('shows a Reload button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('does not render children in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.queryByText('Child content')).not.toBeInTheDocument()
  })
})
