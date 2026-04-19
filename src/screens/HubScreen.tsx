import { useAuth } from '../hooks/useAuth'

export function HubScreen() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
      >
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
    >
      <h1 className="text-2xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
        Welcome, {user?.first_name ?? 'Guest'}
      </h1>
    </div>
  )
}
