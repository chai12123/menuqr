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
    return <div>ไม่พบข้อมูลร้านค้า กรุณาสร้างร้านค้าใหม่</div>
  }

  const { count: totalMenu } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id)
  const { count: totalCategories } = await supabase.from('categories').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id)
  const { count: activeItems } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'available')
  const { count: soldOutItems } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('shop_id', shop.id).eq('status', 'sold_out')

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-3 sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">สวัสดี, {shop.name_th || shop.name_en} 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">นี่คือข้อมูลภาพรวมเมนูดิจิทัลของร้านคุณ</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary rounded-xl" asChild>
             <Link href={`/menu/${shop.slug}`} target="_blank">
               <ExternalLink className="mr-2 h-4 w-4" /> ดูหน้าร้าน
             </Link>
           </Button>
           <Button className="bg-primary text-primary-foreground shadow-md hover:shadow-lg rounded-xl" asChild>
             <Link href="/admin/menu/new">
               <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มเมนูใหม่
             </Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">จำนวนเมนูทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalMenu || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">หมวดหมู่ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black">{totalCategories || 0}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-semibold text-green-600">พร้อมขาย</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-3xl font-black text-green-600">{activeItems || 0}</div>
           </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-md bg-destructive/5">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-semibold text-destructive">ของหมด</CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-3xl font-black text-destructive">{soldOutItems || 0}</div>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 pt-4">
        <Card className="flex flex-col justify-center items-center p-10 text-center space-y-5 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-background to-muted/30">
           <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
             <QrCode className="h-16 w-16 text-primary" />
           </div>
           <h3 className="font-extrabold text-2xl text-foreground">คิวอาร์โค้ดของคุณพร้อมแล้ว</h3>
           <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
             ดาวน์โหลดคิวอาร์โค้ดแบบปรับแต่งสีสันได้ เพื่อนำไปสร้างสแตนดี้วางบนโต๊ะอาหาร หรือให้ลูกค้าสแกนได้ทันที
           </p>
           <Button variant="outline" className="h-12 px-6 rounded-full border-2 hover:bg-muted font-bold" asChild>
             <Link href="/admin/qr-code">ไปที่หน้าดาวน์โหลด QR Code</Link>
           </Button>
        </Card>
      </div>
    </div>
  )
}
