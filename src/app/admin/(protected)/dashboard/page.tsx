import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ExternalLink, PlusCircle, QrCode } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user?.id)
    .single()

  if (!shop) {
    return <div>Start by creating a shop.</div>
  }

  const { count: totalMenu } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id)
  const { count: totalCategories } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id)
  const { count: activeItems } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'available')
  const { count: soldOutItems } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'sold_out')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonjour, {shop.name_en || shop.name_th}</h1>
          <p className="text-muted-foreground">Here's an overview of your digital menu.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild>
             <Link href={`/menu/${shop.slug}`} target="_blank">
               <ExternalLink className="mr-2 h-4 w-4" /> View Menu
             </Link>
           </Button>
           <Button className="bg-primary text-primary-foreground" asChild>
             <Link href="/admin/menu/new">
               <PlusCircle className="mr-2 h-4 w-4" /> Add Item
             </Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMenu || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{totalCategories || 0}</div>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-green-600">Available</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeItems || 0}</div>
           </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-red-600">Sold Out</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold text-red-600">{soldOutItems || 0}</div>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col justify-center items-center p-8 text-center space-y-4">
           <QrCode className="h-24 w-24 text-primary" />
           <h3 className="font-semibold text-xl">Your QR Code is Ready</h3>
           <p className="text-muted-foreground max-w-sm">
             Download your custom QR code to print on tables or displays.
           </p>
           <Button variant="secondary" asChild>
             <Link href="/admin/qr-code">Download QR Code</Link>
           </Button>
        </Card>
      </div>
    </div>
  )
}
