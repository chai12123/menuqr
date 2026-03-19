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
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteMenuItem(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Item deleted')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search items..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_th}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold_out">Sold Out</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-muted rounded-md p-1 border">
            <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setView('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No menu items found.</p>
        </div>
      ) : (
        <div className={
          view === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
          : "flex flex-col gap-4"
        }>
          {filteredItems.map(item => (
            <Card key={item.id} className={view === 'list' ? "flex flex-row overflow-hidden shadow-sm" : "overflow-hidden flex flex-col shadow-sm"}>
              <div className={view === 'list' ? "w-32 h-32 relative shrink-0 bg-muted" : "w-full aspect-video relative bg-muted"}>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name_en || item.name_th} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                    <ImageIcon className="h-8 w-8 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.status === 'sold_out' && <Badge variant="destructive">Sold Out</Badge>}
                  {item.status === 'hidden' && <Badge variant="secondary">Hidden</Badge>}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <CardContent className="p-4 flex-1 space-y-2">
                  <div className="flex justify-between items-start gap-2 max-w-full">
                    <div className="truncate">
                      <h3 className="font-semibold truncate">{item.name_th}</h3>
                      {item.name_en && <p className="text-xs text-muted-foreground truncate">{item.name_en}</p>}
                    </div>
                    <span className="font-bold text-primary shrink-0">{item.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && <Badge variant="outline" className="text-xs">{item.category.name_th}</Badge>}
                    {item.badges?.map((badge: string) => (
                      <Badge key={badge} variant="secondary" className="text-[10px] px-1 py-0">{badge}</Badge>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/menu/${item.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
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
