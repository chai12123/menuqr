import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, QrCode, Smartphone, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-primary/20 rounded-full blur-[100px] opacity-60 pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_40%)] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_40%)] pointer-events-none -z-10" />
      
      <main className="max-w-5xl mx-auto text-center space-y-8 z-10 w-full">
        <div className="inline-flex items-center justify-center p-4 bg-background/80 rounded-3xl mb-4 border shadow-xl backdrop-blur-md">
          <QrCode className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground drop-shadow-sm">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-500">MenuQR</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          The fastest and most beautiful way to create, manage, and share digital menus for your restaurant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 mb-12 text-left pt-8">
          <div className="bg-card/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-lg flex flex-col items-start gap-4 hover:bg-card hover:-translate-y-2 transition-all duration-300">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 shadow-inner"><Smartphone className="w-8 h-8 text-primary" /></div>
            <h3 className="font-bold text-xl">Mobile First</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Stunning, app-like menus perfectly optimized for your customers' smartphones.</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-lg flex flex-col items-start gap-4 hover:bg-card hover:-translate-y-2 transition-all duration-300 delay-75">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 shadow-inner"><Zap className="w-8 h-8 text-primary" /></div>
            <h3 className="font-bold text-xl">Instant Updates</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Change prices, update photos, or mark items sold out in real-time instantly across all devices.</p>
          </div>
          <div className="bg-card/60 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-lg flex flex-col items-start gap-4 hover:bg-card hover:-translate-y-2 transition-all duration-300 delay-150">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 shadow-inner"><QrCode className="w-8 h-8 text-primary" /></div>
            <h3 className="font-bold text-xl">Custom QR Codes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Generate print-ready QR code standees with your restaurant logo directly from the dashboard.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/admin/register">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-[0_0_40px_-10px_rgba(249,115,22,0.8)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,1)] transition-all hover:-translate-y-1 font-bold">
              Create Your Shop <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-background/50 backdrop-blur-md border-2 hover:bg-muted font-bold transition-all">
              Login to Dashboard
            </Button>
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-6 text-center text-xs sm:text-sm text-muted-foreground font-medium tracking-wide w-full">
        Powered by Next.js 14, Supabase, and Tailwind CSS
      </footer>
    </div>
  )
}
