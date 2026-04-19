import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ShopQrCode } from '../ShopQrCode'

describe('ShopQrCode', () => {
  it('renders QR code image with correct alt text', () => {
    render(<ShopQrCode shopName="Bean Bar" qrDataUrl="data:image/png;base64,abc" />)
    const img = screen.getByRole('img', { name: 'QR code for Bean Bar' })
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abc')
  })

  it('renders shop name text', () => {
    render(<ShopQrCode shopName="Bean Bar" qrDataUrl="data:image/png;base64,abc" />)
    expect(screen.getByText('Bean Bar')).toBeInTheDocument()
  })

  it('sets QR image dimensions to 256x256', () => {
    render(<ShopQrCode shopName="Test" qrDataUrl="data:image/png;base64,abc" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '256')
    expect(img).toHaveAttribute('height', '256')
  })
})
