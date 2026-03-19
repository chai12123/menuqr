'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCategory(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const shopId = formData.get('shop_id') as string
  const name_th = formData.get('name_th') as string
  const name_en = formData.get('name_en') as string

  const { data: categories } = await supabase.from('categories').select('sort_order').eq('shop_id', shopId).order('sort_order', { ascending: false }).limit(1)
  const maxSort = categories?.[0]?.sort_order ?? 0

  const { error } = await supabase.from('categories').insert({
    shop_id: shopId,
    name_th,
    name_en,
    sort_order: maxSort + 1
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateCategory(id: string, updates: any) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function reorderCategories(updates: { id: string, sort_order: number }[]) {
  const supabase = createClient()
  for (const update of updates) {
    await supabase.from('categories').update({ sort_order: update.sort_order }).eq('id', update.id)
  }
  revalidatePath('/admin/categories')
  return { success: true }
}
