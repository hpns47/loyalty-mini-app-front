// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { showToast } from '../toast'

beforeEach(() => {
  vi.useFakeTimers()
  // Mock requestAnimationFrame to execute callbacks synchronously
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0)
    return 0
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.getElementById('__toast-container')?.remove()
})

describe('showToast', () => {
  it('creates #__toast-container in document.body', () => {
    showToast('hello')
    const el = document.getElementById('__toast-container')
    expect(el).not.toBeNull()
    expect(el!.textContent).toBe('hello')
  })

  it('reuses existing container on second call', () => {
    showToast('first')
    showToast('second')
    expect(document.querySelectorAll('#__toast-container').length).toBe(1)
    expect(document.getElementById('__toast-container')!.textContent).toBe('second')
  })

  it('fades in via requestAnimationFrame', () => {
    showToast('test')
    const el = document.getElementById('__toast-container')!
    expect(el.style.opacity).toBe('1')
  })

  it('fades out after default 3000ms', () => {
    showToast('test')
    const el = document.getElementById('__toast-container')!
    expect(el.style.opacity).toBe('1')
    vi.advanceTimersByTime(3000)
    expect(el.style.opacity).toBe('0')
  })

  it('fades out after custom duration', () => {
    showToast('test', 1000)
    const el = document.getElementById('__toast-container')!
    vi.advanceTimersByTime(999)
    expect(el.style.opacity).toBe('1')
    vi.advanceTimersByTime(1)
    expect(el.style.opacity).toBe('0')
  })

  it('clears previous timer when called again before fadeout', () => {
    showToast('first', 3000)
    vi.advanceTimersByTime(2000)
    showToast('second', 3000)
    const el = document.getElementById('__toast-container')!
    // 2s into second toast — still visible
    vi.advanceTimersByTime(2000)
    expect(el.style.opacity).toBe('1')
    expect(el.textContent).toBe('second')
    // 3s total for second toast — fades out
    vi.advanceTimersByTime(1000)
    expect(el.style.opacity).toBe('0')
  })

  it('applies expected positioning styles', () => {
    showToast('styled')
    const el = document.getElementById('__toast-container')!
    expect(el.style.position).toBe('fixed')
    expect(el.style.zIndex).toBe('9999')
    expect(el.style.pointerEvents).toBe('none')
  })
})
