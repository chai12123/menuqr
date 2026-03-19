'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateShopSettings(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const shopId = formData.get('shop_id') as string
  const name_th = formData.get('name_th') as string
  const name_en = formData.get('name_en') as string
  const description_th = formData.get('description_th') as string
  const description_en = formData.get('description_en') as string
  const phone = formData.get('phone') as string
  const currency = formData.get('currency') as string

  const logoFile = formData.get('logo') as File | null
  let logo_url = formData.get('existing_logo_url') as string

  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split('.').pop()
    const fileName = `${shopId}-${Date.now()}.${fileExt}`
    
    // Upload to 'menu-images'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(`logos/${fileName}`, logoFile, { upsert: true })
      
    if (uploadError) {
      return { error: 'Failed to upload logo: ' + uploadError.message }
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(`logos/${fileName}`)
      
    logo_url = publicUrlData.publicUrl
  }

  const { error } = await supabase
    .from('shops')
    .update({
      name_th, name_en, description_th, description_en, phone, currency, logo_url
    })
    .eq('id', shopId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/admin/shop-settings')
  return { success: true }
}
