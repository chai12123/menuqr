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

  if (!shop) return <div>No shop found.</div>

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

  return <CategoryList initialCategories={formattedCategories} shopId={shop.id} />
}
