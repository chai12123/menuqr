import { createClient } from '@/lib/supabase/server'
import { MenuForm } from '../menu-form'

export default async function NewMenuItemPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shop!.id)
    .order('sort_order')

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">เพิ่มเมนูใหม่</h1>
        <p className="text-muted-foreground mt-1 text-sm">สร้างและเพิ่มเมนูอาหารใหม่ลงในร้านของคุณ</p>
      </div>
      <MenuForm categories={categories || []} shopId={shop!.id} />
    </div>
  )
}
