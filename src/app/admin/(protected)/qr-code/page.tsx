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

  if (!shop) return <div className="p-8 text-center text-muted-foreground">ไม่พบข้อมูลร้านค้า</div>

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="space-y-6 font-sans pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">ระบบสร้างคิวอาร์โค้ด</h1>
        <p className="text-muted-foreground mt-1 text-sm">ออกแบบ ปรับแต่งสี และดาวน์โหลดคิวอาร์โค้ดสำหรับสแกนดูเมนูของร้านคุณ</p>
      </div>
      <QrGenerator shop={shop} baseUrl={baseUrl} />
    </div>
  )
}
