import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QrScanScreen } from '../QrScanScreen'
import { mockTelegramWebApp, cleanupTelegramMock, type TelegramMock } from '../../test-utils'

let tg: TelegramMock

beforeEach(() => {
  tg = mockTelegramWebApp()
})

afterEach(() => {
  cleanupTelegramMock()
  vi.restoreAllMocks()
})

describe('QrScanScreen', () => {
  it('renders 300x300 viewfinder area', () => {
    render(<QrScanScreen />)
    const viewfinder = document.querySelector('[style*="width: 300"]')
    expect(viewfinder).toBeInTheDocument()
    expect(viewfinder).toHaveStyle({ width: '300px', height: '300px' })
  })

  it('renders corner bracket markers', () => {
    render(<QrScanScreen />)
    // 4 corner markers with green border (#88E60D)
    const corners = document.querySelectorAll('[style*="border-color: rgb(136, 230, 13)"]')
    expect(corners.length).toBe(4)
  })

  it('renders flash toggle button', () => {
    render(<QrScanScreen />)
    const flashButton = screen.getByLabelText('Turn on flash')
    expect(flashButton).toBeInTheDocument()
  })

  it('toggles flash state on click', () => {
    render(<QrScanScreen />)
    const flashButton = screen.getByLabelText('Turn on flash')
    fireEvent.click(flashButton)
    expect(screen.getByLabelText('Turn off flash')).toBeInTheDocument()
  })

  it('back button calls onBack', () => {
    const onBack = vi.fn()
    render(<QrScanScreen onBack={onBack} />)
    const backButton = screen.getByLabelText('Go back')
    fireEvent.click(backButton)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('dock renders with scan tab active', () => {
    render(<QrScanScreen activeTab="scan" />)
    expect(document.querySelector('.absolute')).toBeInTheDocument()
  })

  it('hides BackButton and MainButton on mount', () => {
    render(<QrScanScreen />)
    expect(tg.BackButton.hide).toHaveBeenCalled()
    expect(tg.MainButton.hide).toHaveBeenCalled()
  })
})
