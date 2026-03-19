import { createClient } from '@/lib/supabase/server'
import { MenuList } from './menu-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function MenuItemsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  const { data: categories } = await supabase.from('categories').select('*').eq('shop_id', shop!.id).order('sort_order')
  
  const { data: items } = await supabase
    .from('menu_items')
    .select('*, category:categories(name_th)')
    .eq('shop_id', shop!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการเมนูอาหาร</h1>
          <p className="text-muted-foreground mt-1 text-sm">จัดการรูปภาพ ราคา สถานะของหมด/พร้อมขาย ของเมนูทั้งหมดในร้าน</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full shadow-md h-12 px-6" asChild>
          <Link href="/admin/menu/new">
            <Plus className="mr-2 h-5 w-5" /> เพิ่มเมนูใหม่
          </Link>
        </Button>
      </div>
      
      <MenuList items={items || []} categories={categories || []} />
    </div>
  )
}
