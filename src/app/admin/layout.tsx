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
import { logout } from './actions'

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
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background px-4 py-6">
        <div className="flex items-center gap-2 mb-8 px-2 font-bold text-xl text-primary">
          <UtensilsCrossed className="w-6 h-6" /> MenuQR
        </div>
        <nav className="flex-1 space-y-1">
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} text="Dashboard" />
          <NavItem href="/admin/menu" icon={<UtensilsCrossed size={20} />} text="Menu Items" />
          <NavItem href="/admin/categories" icon={<Tags size={20} />} text="Categories" />
          <NavItem href="/admin/qr-code" icon={<QrCode size={20} />} text="QR Code" />
          <NavItem href="/admin/shop-settings" icon={<Settings size={20} />} text="Shop Settings" />
        </nav>
        
        {shop && (
          <div className="mb-4">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href={`/menu/${shop.slug}`} target="_blank">
                <Store size={20} /> View Public Menu
              </Link>
            </Button>
          </div>
        )}
        
        <form action={logout}>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
            <LogOut size={20} /> Log out
          </Button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:p-8 p-4">
           {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, text }: { href: string; icon: ReactNode; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
      <span className="text-muted-foreground">{icon}</span>
      {text}
    </Link>
  )
}
