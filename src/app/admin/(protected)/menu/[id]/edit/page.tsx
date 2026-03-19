import { createClient } from '@/lib/supabase/server'
import { MenuForm } from '../../menu-form'
import { notFound } from 'next/navigation'

export default async function EditMenuItemPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user?.id).single()

  const { data: item } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', params.id)
    .eq('shop_id', shop!.id)
    .single()

  if (!item) return notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shop!.id)
    .order('sort_order')

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">แก้ไขข้อมูลเมนู</h1>
        <p className="text-muted-foreground mt-1 text-sm">เปลี่ยนรูปภาพ ราคา หรือคำอธิบายของเมนูนี้</p>
      </div>
      <MenuForm item={item} categories={categories || []} shopId={shop!.id} />
    </div>
  )
}
