import { createClient } from '@/lib/supabase/server'
import { QrGenerator } from './qr-generator'

export default async function QrCodePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user?.id)
    .single()

  if (!shop) return <div>No shop found.</div>

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-muted-foreground">Customize and download the QR code for your digital menu.</p>
      </div>
      <QrGenerator shop={shop} baseUrl={baseUrl} />
    </div>
  )
}
