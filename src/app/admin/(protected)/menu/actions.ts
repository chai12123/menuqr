'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveMenuItem(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const shopId = formData.get('shop_id') as string
  const category_id = formData.get('category_id') as string || null
  const name_th = formData.get('name_th') as string
  const name_en = formData.get('name_en') as string
  const description_th = formData.get('description_th') as string
  const description_en = formData.get('description_en') as string
  const price = parseFloat(formData.get('price') as string)
  const status = formData.get('status') as string
  
  const badgesStr = formData.get('badges') as string
  const badges = badgesStr ? badgesStr.split(',') : []

  const imageFile = formData.get('image') as File | null
  let image_url = formData.get('existing_image_url') as string

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop() || 'webp'
    const fileName = `${shopId}/items/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(fileName, imageFile, { upsert: true })
      
    if (uploadError) return { error: 'Upload failed: ' + uploadError.message }
    
    const { data: publicUrlData } = supabase.storage.from('menu-images').getPublicUrl(fileName)
    image_url = publicUrlData.publicUrl
  }

  const payload = {
    shop_id: shopId, category_id, name_th, name_en, description_th, description_en,
    price, status, badges, image_url
  }

  if (id) {
    const { error } = await supabase.from('menu_items').update(payload).eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('menu_items').insert(payload)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/menu')
  return { success: true }
}

export async function deleteMenuItem(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('menu_items').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/menu')
  return { success: true }
}
