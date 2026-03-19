'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { deleteMenuItem } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Image as ImageIcon, Pencil, Trash2, LayoutGrid, List } from 'lucide-react'
import { toast } from 'sonner'

export function MenuList({ items: initialItems, categories }: { items: any[], categories: any[] }) {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [view, setView] = useState<'grid'|'list'>('grid')

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name_th.toLowerCase().includes(search.toLowerCase()) || 
                          (item.name_en?.toLowerCase() || '').includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      const matchCat = catFilter === 'all' || item.category_id === catFilter
      return matchSearch && matchStatus && matchCat
    })
  }, [items, search, statusFilter, catFilter])

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบเมนูนี้ออกจากร้าน? ประวัติและรูปภาพจะหายไปอย่างถาวร')) {
      await deleteMenuItem(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('ลบเมนูเรียบร้อยแล้ว')
    }
  }

  const translateBadge = (badge: string) => {
    const map: Record<string, string> = {
      'recommended': 'แนะนำ',
      'popular': 'ยอดฮิต',
      'new': 'ใหม่',
      'spicy': 'เผ็ด'
    }
    return map[badge] || badge
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border-0 shadow-lg">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="ค้นหาชื่อเมนู..." 
            className="pl-11 h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full justify-between lg:justify-end lg:w-auto">
          <div className="flex gap-3 flex-1 lg:flex-initial">
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[140px] md:w-[180px] h-12 rounded-xl">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-xl">
                <SelectItem value="all" className="font-semibold">หมวดหมู่ทั้งหมด</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_th}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] md:w-[150px] h-12 rounded-xl">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-xl">
                <SelectItem value="all" className="font-semibold">สถานะทั้งหมด</SelectItem>
                <SelectItem value="available" className="text-green-600 font-bold">พร้อมขาย</SelectItem>
                <SelectItem value="sold_out" className="text-destructive font-bold">ของหมด</SelectItem>
                <SelectItem value="hidden" className="text-muted-foreground font-bold">ซ่อน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex bg-muted rounded-xl p-1 border shadow-inner">
            <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className={`h-10 w-10 rounded-lg ${view === 'grid' ? 'shadow-sm bg-background' : ''}`} onClick={() => setView('grid')}>
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className={`h-10 w-10 rounded-lg ${view === 'list' ? 'shadow-sm bg-background' : ''}`} onClick={() => setView('list')}>
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center p-16 border-2 border-dashed rounded-3xl bg-muted/20">
          <p className="text-muted-foreground text-lg mb-4">ไม่พบข้อมูลเมนูอาหารที่คุณค้นหา</p>
        </div>
      ) : (
        <div className={
          view === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" 
          : "flex flex-col gap-4"
        }>
          {filteredItems.map(item => (
            <Card key={item.id} className={`${view === 'list' ? "flex flex-row overflow-hidden shadow-md" : "overflow-hidden flex flex-col shadow-lg"} rounded-2xl border-0 hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}>
              <div className={view === 'list' ? "w-32 h-auto relative shrink-0 bg-muted/50 border-r" : "w-full aspect-square md:aspect-video relative bg-muted/50 border-b"}>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name_th} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2 shadow-sm">
                  {item.status === 'sold_out' && <Badge variant="destructive" className="px-3 py-1 shadow-sm font-bold text-xs uppercase tracking-wider backdrop-blur-md bg-destructive/90">ของหมด</Badge>}
                  {item.status === 'hidden' && <Badge variant="secondary" className="px-3 py-1 shadow-sm font-bold text-xs uppercase tracking-wider backdrop-blur-md bg-secondary/90">ซ่อนเอาไว้</Badge>}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <CardContent className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-start gap-3 w-full">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-lg text-foreground truncate">{item.name_th}</h3>
                      {item.name_en && <p className="text-sm text-muted-foreground font-medium truncate">{item.name_en}</p>}
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full shrink-0">
                      <span className="font-black">${item.price}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {item.category && <Badge variant="outline" className="bg-background text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary">{item.category.name_th}</Badge>}
                    {item.badges?.map((badge: string) => (
                      <Badge key={badge} className="bg-amber-400 text-amber-950 hover:bg-amber-500 text-[10px] px-1.5 py-0 font-bold border-0">{translateBadge(badge)}</Badge>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-4 border-t bg-muted/10 flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl border-2 font-bold px-4" asChild>
                    <Link href={`/admin/menu/${item.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" /> แก้ไขเมนู
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
