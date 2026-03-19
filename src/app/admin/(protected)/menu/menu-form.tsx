'use client'
import { useState } from 'react'
import { saveMenuItem } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { compressImage } from '@/lib/image-compression'
import { ImagePlus } from 'lucide-react'

export function MenuForm({ item, categories, shopId }: { item?: any, categories: any[], shopId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState(item?.image_url || null)
  const [badges, setBadges] = useState<string[]>(item?.badges || [])
  const [categoryId, setCategoryId] = useState(item?.category_id || '')
  
  const badgeOptions = [
    { id: 'recommended', label: 'แนะนำ' },
    { id: 'popular', label: 'ยอดฮิต' },
    { id: 'new', label: 'ใหม่' },
    { id: 'spicy', label: 'เผ็ด' }
  ]

  const toggleBadge = (b: string) => {
    setBadges(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  }

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    
    formData.set('category_id', categoryId === 'none' ? '' : categoryId)
    formData.set('badges', badges.join(','))
    
    // Compress image if there is one
    const imageFile = formData.get('image') as File
    if (imageFile && imageFile.size > 0) {
      try {
        const compressed = await compressImage(imageFile)
        formData.set('image', compressed)
      } catch (e) {
        toast.error('เกิดข้อผิดพลาดในการปรับขนาดรูปภาพ')
        setIsLoading(false)
        return
      }
    }

    const res = await saveMenuItem(formData)
    setIsLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(item ? 'อัปเดตเมนูเรียบร้อยแล้ว' : 'เพิ่มเมนูเรียบร้อยแล้ว')
      router.push('/admin/menu')
      router.refresh()
    }
  }

  return (
    <form action={onSubmit} className="space-y-8 max-w-3xl pb-10">
      <input type="hidden" name="shop_id" value={shopId} />
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="existing_image_url" value={item?.image_url || ''} />

      <div className="bg-card p-6 md:p-8 rounded-3xl shadow-lg border-0 space-y-6">
        <h2 className="text-xl font-bold border-b pb-4">ข้อมูลพื้นฐาน</h2>
        
        <div className="space-y-3">
          <Label className="font-semibold text-base">รูปภาพ (ไม่บังคับ, ขนาดไม่เกิน 5MB)</Label>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-inner border-2 border-dashed border-primary/30 bg-muted/20 flex flex-col items-center justify-center shrink-0">
              {preview ? (
                <Image src={preview} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <ImagePlus className="w-8 h-8 opacity-50" />
                  <span className="text-xs font-medium">เพิ่มรูปภาพ</span>
                </div>
              )}
            </div>
            <div className="space-y-2 flex-1 w-full">
              <Input 
                name="image" 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                className="cursor-pointer file:rounded-full file:bg-primary/10 file:text-primary file:border-0 file:font-semibold file:px-4 h-12 pt-2 bg-muted/30 rounded-xl"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setPreview(URL.createObjectURL(file))
                }}
              />
              <p className="text-xs text-muted-foreground">ระบบจะปรับขนาดภาพพร้อมแปลงให้เป็น WebP อัตโนมัติ เพื่อให้โหลดได้ไวที่สุดบนมือถือลูกค้า</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name_th" className="font-semibold">ชื่อเมนู (ภาษาไทย) *</Label>
            <Input id="name_th" name="name_th" defaultValue={item?.name_th} required className="h-12 rounded-xl bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en" className="font-semibold">ชื่อเมนู (ภาษาอังกฤษ)</Label>
            <Input id="name_en" name="name_en" defaultValue={item?.name_en || ''} className="h-12 rounded-xl bg-muted/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price" className="font-semibold">ราคา *</Label>
            <Input id="price" name="price" type="number" step="any" defaultValue={item?.price} required className="h-12 rounded-xl bg-muted/30 font-bold text-lg text-primary" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">หมวดหมู่</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 rounded-xl bg-muted/30">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่มีหมวดหมู่</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name_th}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="description_th" className="font-semibold">คำอธิบาย (ภาษาไทย)</Label>
          <Input id="description_th" name="description_th" defaultValue={item?.description_th || ''} className="h-12 rounded-xl bg-muted/30" placeholder="เช่น สูตรพิเศษของทางร้าน" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description_en" className="font-semibold">คำอธิบาย (ภาษาอังกฤษ)</Label>
          <Input id="description_en" name="description_en" defaultValue={item?.description_en || ''} className="h-12 rounded-xl bg-muted/30" />
        </div>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-3xl shadow-lg border-0 space-y-6">
        <h2 className="text-xl font-bold border-b pb-4">สถานะและป้ายกำกับ</h2>
        
        <div className="space-y-4">
          <Label className="font-semibold text-base">สถานะเมนูตู</Label>
          <RadioGroup name="status" defaultValue={item?.status || 'available'} className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors w-full sm:w-auto">
              <RadioGroupItem value="available" id="available" />
              <Label htmlFor="available" className="text-green-600 font-bold cursor-pointer">พร้อมขาย</Label>
            </div>
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors w-full sm:w-auto">
              <RadioGroupItem value="sold_out" id="sold_out" />
              <Label htmlFor="sold_out" className="text-destructive font-bold cursor-pointer">ของหมด</Label>
            </div>
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors w-full sm:w-auto">
              <RadioGroupItem value="hidden" id="hidden" />
              <Label htmlFor="hidden" className="text-muted-foreground font-bold cursor-pointer">ซ่อน</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label className="font-semibold text-base">ป้ายกำกับ (Badges)</Label>
          <div className="flex flex-wrap gap-3">
            {badgeOptions.map(badge => (
              <div key={badge.id} className={`flex items-center space-x-2 p-3 rounded-xl border transition-colors cursor-pointer ${badges.includes(badge.id) ? 'bg-primary/10 border-primary shadow-sm' : 'bg-muted/30 border-border/50 hover:bg-muted/50'}`}>
                <Checkbox 
                  id={badge.id} 
                  checked={badges.includes(badge.id)}
                  onCheckedChange={() => toggleBadge(badge.id)}
                />
                <Label htmlFor={badge.id} className="font-semibold cursor-pointer">{badge.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
        <Button type="button" variant="outline" className="h-14 sm:w-32 rounded-full font-bold border-2 hover:bg-muted" onClick={() => router.back()}>ยกเลิก</Button>
        <Button className="bg-primary flex-1 h-14 rounded-full font-bold text-lg shadow-[0_0_20px_-5px_rgba(249,115,22,0.8)] hover:shadow-[0_0_30px_-5px_rgba(249,115,22,1)] transition-all" type="submit" disabled={isLoading}>
          {isLoading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลเมนู'}
        </Button>
      </div>
    </form>
  )
}
