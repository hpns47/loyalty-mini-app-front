// Dev-only user presets matching supabase/seed.sql
// Switch users via URL: ?tg_user=dana or ?tg_user=arman
const DEV_USERS: Record<string, { id: number; first_name: string; last_name?: string; username: string }> = {
  alisher:  { id: 123456789, first_name: 'Alisher',  last_name: 'Rymkan',        username: 'alisher_dev' },
  dana:     { id: 987654321, first_name: 'Dana',     last_name: 'Suleimen',      username: 'dana_coffee' },
  arman:    { id: 555111222, first_name: 'Arman',                                username: 'arman_new' },
  asel:     { id: 333444555, first_name: 'Asel',     last_name: 'Kenzhebekova', username: 'asel_k' },
  timur:    { id: 777888999, first_name: 'Timur',    last_name: 'Orazov',        username: 'timur_reward' },
}

export function initTelegramMock() {
  if ((window as any).Telegram?.WebApp) return // real SDK already present

  const params = new URLSearchParams(window.location.search)
  const startParam = params.get('start_param') ?? undefined
  const userKey = params.get('tg_user') ?? 'alisher'
  const user = DEV_USERS[userKey] ?? DEV_USERS.alisher

  // Pass user id + name as mock initData so backend dev bypass can parse it
  const mockInitData = `mock:${JSON.stringify({ id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username })}`

  ;(window as any).Telegram = {
    WebApp: {
      initData: mockInitData,
      initDataUnsafe: {
        user,
        ...(startParam ? { start_param: startParam } : {}),
      },
      themeParams: {},
      ready: () => {},
      expand: () => {},
    },
  }

  if (import.meta.env.DEV) {
    console.log(`[TG Mock] Logged in as: ${user.first_name} (${user.username}, id: ${user.id})`)
  }
}
