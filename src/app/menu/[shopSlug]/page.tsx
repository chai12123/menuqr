import { notFound } from 'next/navigation'
import { PublicMenu } from './public-menu'
import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function generateMetadata({ params }: { params: { shopSlug: string } }): Promise<Metadata> {
  const supabase = getPublicClient()
  const { data: shop } = await supabase.from('shops').select('name_th, name_en, description_th, description_en, logo_url').eq('slug', params.shopSlug).single()
  
  if (!shop) return { title: 'Shop Not Found' }
  
  return {
    title: `${shop.name_th || shop.name_en} - Digital Menu`,
    description: shop.description_th || shop.description_en,
    openGraph: {
      images: shop.logo_url ? [shop.logo_url] : []
    }
  }
}

export async function generateStaticParams() {
  const supabase = getPublicClient()
  const { data: shops } = await supabase.from('shops').select('slug').eq('is_active', true)
  return shops?.map(s => ({ shopSlug: s.slug })) || []
}

export default async function MenuPage({ params }: { params: { shopSlug: string } }) {
  const supabase = getPublicClient()
  
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', params.shopSlug)
    .single()

  if (!shop || !shop.is_active) return notFound()

  // Fetch categories and items
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('shop_id', shop.id)
    .neq('status', 'hidden')
    .order('sort_order', { ascending: true })

  return (
    <PublicMenu initialShop={shop} initialCategories={categories || []} initialItems={items || []} />
  )
}
