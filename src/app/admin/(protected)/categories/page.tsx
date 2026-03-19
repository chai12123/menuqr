import { createClient } from '@/lib/supabase/server'
import { CategoryList } from './category-list'

export default async function CategoriesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user?.id)
    .single()

  if (!shop) return <div className="p-8 text-center text-muted-foreground">ไม่พบข้อมูลร้านค้า</div>

  // Fetch categories with menu item count
  const { data: categories } = await supabase
    .from('categories')
    .select('*, menu_items(count)')
    .eq('shop_id', shop.id)
    .order('sort_order', { ascending: true })

  const formattedCategories = categories?.map(c => ({
    ...c,
    items_count: c.menu_items[0]?.count || 0
  })) || []

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการหมวดหมู่เมนู</h1>
        <p className="text-muted-foreground mt-1 text-sm">จัดเรียง ลบ หรือเพิ่มหมวดหมู่ใหม่ (ลูกค้าจะเห็นเรียงตามลำดับนี้)</p>
      </div>
      <CategoryList initialCategories={formattedCategories} shopId={shop.id} />
    </div>
  )
}
