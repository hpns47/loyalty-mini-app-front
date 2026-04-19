import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (qrString: string) => void
}

export function CashierScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const didScanRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('cashier-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          // Prevent firing multiple times for the same scan
          if (didScanRef.current) return
          didScanRef.current = true

          // Stop scanner before calling onScan so camera releases cleanly
          scanner.stop().catch(() => {}).finally(() => {
            onScan(decodedText)
          })
        },
        () => {
          // QR not found in frame — ignore per-frame errors
        },
      )
      .catch((err) => {
        console.error('CashierScanner: failed to start', err)
      })

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {}).finally(() => scanner.clear())
      } else {
        scanner.clear()
      }
    }
  }, [onScan])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      <div id="cashier-reader" style={{ width: '100%' }} />
    </div>
  )
}
