interface Props {
  shopName: string
  qrDataUrl: string
}

export function ShopQrCode({ shopName, qrDataUrl }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <img src={qrDataUrl} alt={`QR code for ${shopName}`} width={256} height={256} />
      <p className="text-sm font-medium">{shopName}</p>
    </div>
  )
}
