import { createClient } from '@/lib/supabase/server'
import { ShopSettingsForm } from './shop-settings-form'

export default async function ShopSettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user?.id)
    .single()

  if (!shop) return <div>ไม่พบข้อมูลร้านค้า</div>

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ตั้งค่าร้านค้า</h1>
        <p className="text-muted-foreground mt-1 text-sm">จัดการข้อมูลพื้นฐาน โลโก้ และข้อมูลการติดต่อของร้านคุณ</p>
      </div>
      <ShopSettingsForm shop={shop} />
    </div>
  )
}
