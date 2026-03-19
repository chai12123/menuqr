'use client'

import { useState } from 'react'
import { updateShopSettings } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export function ShopSettingsForm({ shop }: { shop: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(shop.logo_url)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await updateShopSettings(formData)
    setIsLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Shop settings updated successfully!')
    }
  }

  return (
    <form action={onSubmit} className="space-y-8 max-w-2xl">
      <input type="hidden" name="shop_id" value={shop.id} />
      <input type="hidden" name="existing_logo_url" value={shop.logo_url || ''} />

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Shop Logo</Label>
            {logoPreview && (
              <div className="mb-4 relative w-32 h-32 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
              </div>
            )}
            <Input 
              id="logo" 
              name="logo" 
              type="file" 
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setLogoPreview(URL.createObjectURL(file))
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name_th">Shop Name (Thai) *</Label>
              <Input id="name_th" name="name_th" defaultValue={shop.name_th} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">Shop Name (English)</Label>
              <Input id="name_en" name="name_en" defaultValue={shop.name_en || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_th">Description (Thai)</Label>
            <Input id="description_th" name="description_th" defaultValue={shop.description_th || ''} />
          </div>
          <div className="space-y-2">
             <Label htmlFor="description_en">Description (English)</Label>
             <Input id="description_en" name="description_en" defaultValue={shop.description_en || ''} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={shop.phone || ''} />
             </div>
             <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue={shop.currency || 'THB'} />
             </div>
          </div>
        </CardContent>
      </Card>
      
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
