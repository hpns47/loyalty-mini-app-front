const CONTAINER_ID = '__toast-container'
const DEFAULT_DURATION_MS = 3000

let hideTimer: ReturnType<typeof setTimeout> | null = null

function getOrCreateContainer(): HTMLDivElement {
  let el = document.getElementById(CONTAINER_ID) as HTMLDivElement | null
  if (el) return el

  el = document.createElement('div')
  el.id = CONTAINER_ID
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
    opacity: '0',
  })
  document.body.appendChild(el)
  return el
}

export function showToast(message: string, durationMs = DEFAULT_DURATION_MS): void {
  const container = getOrCreateContainer()

  container.textContent = message
  Object.assign(container.style, {
    backgroundColor: 'var(--tg-theme-secondary-bg-color, #F2F5F8)',
    color: 'var(--tg-theme-text-color, #0E121B)',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
    opacity: '0',
  })

  // Fade in
  requestAnimationFrame(() => {
    container.style.opacity = '1'
  })

  // Clear existing timer
  if (hideTimer) clearTimeout(hideTimer)

  // Fade out and remove text
  hideTimer = setTimeout(() => {
    container.style.opacity = '0'
  }, durationMs)
}
