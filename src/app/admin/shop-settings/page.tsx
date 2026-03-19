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

  if (!shop) return <div>No shop found.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop Settings</h1>
        <p className="text-muted-foreground">Manage your shop details and appearance.</p>
      </div>
      <ShopSettingsForm shop={shop} />
    </div>
  )
}
