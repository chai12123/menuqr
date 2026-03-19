import { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Settings,
  QrCode,
  LogOut,
  Store,
} from 'lucide-react'
import { logout } from '../actions'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/20 font-sans">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background px-4 py-6 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-8 px-2 font-black text-2xl text-primary tracking-tight">
          <UtensilsCrossed className="w-8 h-8 rounded-lg bg-primary/10 p-1.5" /> MenuQR
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} text="ภาพรวมร้านค้า" />
          <NavItem href="/admin/menu" icon={<UtensilsCrossed size={20} />} text="จัดการเมนูอาหาร" />
          <NavItem href="/admin/categories" icon={<Tags size={20} />} text="หมวดหมู่เมนู" />
          <NavItem href="/admin/qr-code" icon={<QrCode size={20} />} text="คิวอาร์โค้ด (QR)" />
          <NavItem href="/admin/shop-settings" icon={<Settings size={20} />} text="ตั้งค่าร้านค้า" />
        </nav>
        
        {shop && (
          <div className="mb-4">
            <Button variant="outline" className="w-full justify-start gap-2 h-12 rounded-xl font-semibold border-primary/20 hover:bg-primary/5 text-primary hover:text-primary transition-colors" asChild>
              <Link href={`/menu/${shop.slug}`} target="_blank">
                <Store size={20} /> ดูหน้าร้านของลูกค้า
              </Link>
            </Button>
          </div>
        )}
        
        <form action={logout}>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl transition-colors">
            <LogOut size={20} /> ออกจากระบบ
          </Button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="md:p-10 p-4 max-w-6xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, text }: { href: string; icon: ReactNode; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-sm font-semibold transition-all group">
      <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
      {text}
    </Link>
  )
}
