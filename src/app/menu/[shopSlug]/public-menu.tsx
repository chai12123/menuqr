'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Globe, Phone, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

export function PublicMenu({ initialShop, initialCategories, initialItems }: { initialShop: any, initialCategories: any[], initialItems: any[] }) {
  const supabase = createClient()
  const [shop] = useState(initialShop)
  const [categories, setCategories] = useState(initialCategories)
  const [items, setItems] = useState(initialItems)
  const [lang, setLang] = useState<'th'|'en'>('th')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  
  const sectionRefs = useRef<{[key:string]: HTMLDivElement | null}>({})

  useEffect(() => {
    // Realtime subscriptions for immediate UI updates when admin changes menu
    const channel = supabase.channel(`public-menu-${shop.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items', filter: `shop_id=eq.${shop.id}` }, payload => {
        setItems(prev => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.status === 'hidden') return prev
            return [...prev, payload.new]
          }
          if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'hidden') return prev.filter(i => i.id !== payload.new.id)
            if (!prev.find(i => i.id === payload.new.id)) return [...prev, payload.new]
            return prev.map(i => i.id === payload.new.id ? payload.new : i)
          }
          if (payload.eventType === 'DELETE') return prev.filter(i => i.id !== (payload.old as any).id)
          return prev
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `shop_id=eq.${shop.id}` }, payload => {
        setCategories(prev => {
          if (payload.eventType === 'INSERT') {
            if (!payload.new.is_active) return prev
            return [...prev, payload.new]
          }
          if (payload.eventType === 'UPDATE') {
            if (!payload.new.is_active) return prev.filter(i => i.id !== payload.new.id)
            if (!prev.find(i => i.id === payload.new.id)) return [...prev, payload.new]
            return prev.map(i => i.id === payload.new.id ? payload.new : i)
          }
          if (payload.eventType === 'DELETE') return prev.filter(i => i.id !== (payload.old as any).id)
          return prev
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shop.id, supabase])

  const t = (obj: any, key: string) => {
    if (!obj) return ''
    return lang === 'en' && obj[`${key}_en`] ? obj[`${key}_en`] : obj[`${key}_th`]
  }

  const scrollToCategory = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Filter items by category & search
  const itemsByCat = useMemo(() => {
    const filtered = categories.map(cat => ({
      ...cat,
      items: items.filter(i => i.category_id === cat.id && (
        t(i, 'name').toLowerCase().includes(search.toLowerCase())
      )).sort((a,b) => a.sort_order - b.sort_order)
    })).filter(cat => cat.items.length > 0).sort((a,b) => a.sort_order - b.sort_order)

    const uncatItems = items.filter(i => !i.category_id && (
      t(i, 'name').toLowerCase().includes(search.toLowerCase())
    )).sort((a,b) => a.sort_order - b.sort_order)

    if (uncatItems.length > 0) {
      filtered.push({ id: 'uncategorized', name_th: 'อื่นๆ', name_en: 'Others', items: uncatItems } as any)
    }
    
    return filtered
  }, [categories, items, search, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-muted/20 pb-24 text-foreground selection:bg-primary/20 font-sans">
      {/* Header Banner */}
      <header className="bg-background border-b relative">
        <div className="absolute top-4 right-4 z-10">
          <Button variant="outline" size="sm" onClick={() => setLang(l => l === 'th' ? 'en' : 'th')} className="rounded-full shadow-sm bg-background/80 backdrop-blur">
            <Globe className="w-4 h-4 mr-2 text-primary" /> {lang === 'th' ? 'EN' : 'TH'}
          </Button>
        </div>
        <div className="max-w-3xl mx-auto p-6 flex flex-col items-center text-center space-y-4 pt-12 lg:pt-16">
          {shop.logo_url ? (
            <div className="w-28 h-28 relative rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted">
              <Image src={shop.logo_url} alt="Logo" fill className="object-cover" priority sizes="112px" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg">
              <span className="text-4xl font-bold text-primary">{shop.name_th?.[0] || 'M'}</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t(shop, 'name')}</h1>
            {t(shop, 'description') && (
               <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm leading-relaxed">{t(shop, 'description')}</p>
            )}
          </div>
        </div>

        {/* Sticky Search and Tabs */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur shadow-sm border-b">
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder={lang === 'th' ? "ค้นหาเมนู..." : "Search menu..."}
                className="pl-10 bg-muted/40 rounded-full border-muted-foreground/20 focus-visible:ring-primary/50" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex w-max space-x-2 pb-2">
                {itemsByCat.map(cat => (
                  <Button 
                    key={cat.id} 
                    variant="secondary" 
                    className="rounded-full h-9 px-4 bg-muted/60 hover:bg-muted font-medium text-sm transition-transform active:scale-95"
                    onClick={() => scrollToCategory(cat.id)}
                  >
                    {t(cat, 'name')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 space-y-10 mt-6 lg:mt-10">
        {itemsByCat.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground bg-background rounded-2xl border border-dashed">
            {lang === 'th' ? 'ไม่พบเมนูที่คุณค้นหา' : 'No items found matching your search.'}
          </div>
        ) : (
          itemsByCat.map(cat => (
            <div key={cat.id} ref={el => { sectionRefs.current[cat.id] = el }} className="scroll-mt-40">
              <div className="flex items-center gap-3 mb-5">
                 <h2 className="text-2xl font-bold tracking-tight">{t(cat, 'name')}</h2>
                 <Badge variant="secondary" className="rounded-full px-2 py-0.5 font-medium">{cat.items.length}</Badge>
                 <div className="flex-1 h-px bg-border/60 ml-2" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {cat.items.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="group bg-background rounded-2xl border border-border/60 shadow-sm overflow-hidden flex cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-300 active:scale-[0.98]" 
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {item.badges?.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mb-2">
                            {item.badges.includes('recommended') && <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm">★ Rec</span>}
                            {item.badges.includes('spicy') && <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded-sm">🌶️ Spicy</span>}
                            {item.badges.includes('new') && <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-sm">New</span>}
                          </div>
                        )}
                        <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">{t(item, 'name')}</h3>
                        {item.description_th || item.description_en ? (
                           <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{t(item, 'description')}</p>
                        ) : null}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                         <span className="font-bold text-primary group-hover:scale-105 transition-transform origin-left">{shop.currency} {item.price}</span>
                         {item.status === 'sold_out' && <Badge variant="destructive" className="text-[10px] uppercase tracking-wider bg-red-500">Sold Out</Badge>}
                      </div>
                    </div>
                    {item.image_url ? (
                      <div className="w-[120px] shrink-0 relative m-2 rounded-xl overflow-hidden shadow-sm bg-muted/30">
                        <Image src={item.image_url} alt="Food" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="120px" />
                        {item.status === 'sold_out' && (
                          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] mix-blend-saturation" />
                        )}
                      </div>
                    ) : (
                      <div className="w-2" /> 
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-10 mt-12 flex flex-col items-center justify-center text-sm text-muted-foreground space-y-3 border-t bg-background/50">
        {shop.phone && (
          <div className="flex items-center gap-2 font-medium bg-muted/50 px-4 py-2 rounded-full">
            <Phone className="w-4 h-4 text-primary" /> {shop.phone}
          </div>
        )}
        <div className="flex items-center gap-2">
           <Clock className="w-4 h-4" /> {lang === 'th' ? 'ข้อมูลเพิ่มเติมกรุณาสอบถามพนักงาน' : 'Please ask staff for missing details.'}
        </div>
        <div className="text-xs mt-4 pt-4 border-t w-full text-center">
          Powered by <span className="font-bold text-primary">MenuQR</span>
        </div>
      </footer>

      {/* Item Drawer / Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0 rounded-3xl border-0 shadow-2xl">
           {selectedItem?.image_url && (
              <div className="w-full aspect-square relative bg-muted/20">
                <Image src={selectedItem.image_url} alt="Food" fill className="object-cover" priority sizes="(max-width: 425px) 100vw, 425px" />
                {selectedItem.status === 'sold_out' && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-6 py-2 shadow-lg rounded-full font-bold tracking-wider uppercase">Sold Out</Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
              </div>
           )}
           <div className={`p-6 space-y-4 ${!selectedItem?.image_url && 'pt-10'}`}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4 w-full">
                     <span className="leading-tight">{t(selectedItem || {}, 'name')}</span>
                     <span className="text-primary whitespace-nowrap font-black">{shop.currency} {selectedItem?.price}</span>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-base mt-3 text-foreground/80 leading-relaxed">
                  {t(selectedItem || {}, 'description')}
                </DialogDescription>
              </DialogHeader>
              
              {selectedItem?.badges?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedItem.badges.map((b: string) => (
                     <Badge key={b} variant="secondary" className="capitalize px-3 py-1 bg-muted/60 text-foreground font-medium rounded-full">
                        {b === 'spicy' ? '🌶️ Spicy' : b === 'recommended' ? '⭐ Recommended' : b === 'new' ? '🆕 New' : '👍 Popular'}
                     </Badge>
                  ))}
                </div>
              )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
