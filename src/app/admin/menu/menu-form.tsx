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

export function MenuForm({ item, categories, shopId }: { item?: any, categories: any[], shopId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState(item?.image_url || null)
  const [badges, setBadges] = useState<string[]>(item?.badges || [])
  const [categoryId, setCategoryId] = useState(item?.category_id || '')
  
  const badgeOptions = ['recommended', 'popular', 'new', 'spicy']

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
        toast.error('Image compression failed')
        setIsLoading(false)
        return
      }
    }

    const res = await saveMenuItem(formData)
    setIsLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(item ? 'Menu item updated' : 'Menu item created')
      router.push('/admin/menu')
      router.refresh()
    }
  }

  return (
    <form action={onSubmit} className="space-y-8 max-w-2xl bg-card p-6 border rounded-lg shadow-sm">
      <input type="hidden" name="shop_id" value={shopId} />
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="existing_image_url" value={item?.image_url || ''} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        
        <div className="space-y-2">
          <Label>Image (optional, max 5MB)</Label>
          {preview && (
            <div className="relative w-40 h-40 bg-muted rounded-md overflow-hidden border">
              <Image src={preview} alt="Preview" fill className="object-cover" />
            </div>
          )}
          <Input 
            name="image" 
            type="file" 
            accept="image/jpeg, image/png, image/webp"
            className="cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setPreview(URL.createObjectURL(file))
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name_th">Name (Thai) *</Label>
            <Input id="name_th" name="name_th" defaultValue={item?.name_th} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en">Name (English)</Label>
            <Input id="name_en" name="name_en" defaultValue={item?.name_en || ''} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input id="price" name="price" type="number" step="any" defaultValue={item?.price} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name_th}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description_th">Description (Thai)</Label>
          <Input id="description_th" name="description_th" defaultValue={item?.description_th || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description_en">Description (English)</Label>
          <Input id="description_en" name="description_en" defaultValue={item?.description_en || ''} />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-xl font-semibold">Item Status & Options</h2>
        
        <div className="space-y-2">
          <Label>Status</Label>
          <RadioGroup name="status" defaultValue={item?.status || 'available'} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="available" id="available" />
              <Label htmlFor="available">Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sold_out" id="sold_out" />
              <Label htmlFor="sold_out">Sold Out</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hidden" id="hidden" />
              <Label htmlFor="hidden">Hidden</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Badges</Label>
          <div className="flex flex-wrap gap-4">
            {badgeOptions.map(badge => (
              <div key={badge} className="flex items-center space-x-2">
                <Checkbox 
                  id={badge} 
                  checked={badges.includes(badge)}
                  onCheckedChange={() => toggleBadge(badge)}
                />
                <Label htmlFor={badge} className="capitalize">{badge}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button className="bg-primary" type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Item'}</Button>
      </div>
    </form>
  )
}
