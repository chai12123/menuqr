'use client'

import { useState } from 'react'
import { updateShopSettings } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { ImagePlus } from 'lucide-react'

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
      toast.success('บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว!')
    }
  }

  return (
    <form action={onSubmit} className="space-y-8 max-w-3xl pb-10">
      <input type="hidden" name="shop_id" value={shop.id} />
      <input type="hidden" name="existing_logo_url" value={shop.logo_url || ''} />

      <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-xl font-bold">ข้อมูลพื้นฐานร้านค้า</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label htmlFor="logo" className="font-semibold text-base">โลโก้ร้านค้า</Label>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-inner border-2 border-dashed border-primary/30 bg-muted/20 flex flex-col items-center justify-center shrink-0">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo preview" fill className="object-cover" />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <ImagePlus className="w-8 h-8 opacity-50" />
                    <span className="text-xs font-medium">เพิ่มโลโก้</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1 w-full relative">
                <Input 
                  id="logo" 
                  name="logo" 
                  type="file" 
                  accept="image/*"
                  className="cursor-pointer file:rounded-full file:bg-primary/10 file:text-primary file:border-0 file:font-semibold file:px-4 h-12 pt-2 bg-muted/30 rounded-xl"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setLogoPreview(URL.createObjectURL(file))
                  }}
                />
                <p className="text-xs text-muted-foreground">แนะนำรูปร่างจัตุรัสขนาด 500x500px ไฟล์ .jpg หรือ .png</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="name_th" className="font-semibold">ชื่อร้านค้า (ภาษาไทย) *</Label>
              <Input id="name_th" name="name_th" defaultValue={shop.name_th} required className="h-12 rounded-xl bg-muted/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en" className="font-semibold">ชื่อร้านค้า (ภาษาอังกฤษ)</Label>
              <Input id="name_en" name="name_en" defaultValue={shop.name_en || ''} className="h-12 rounded-xl bg-muted/30" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_th" className="font-semibold">คำอธิบายร้านค้า / สโลแกน (ภาษาไทย)</Label>
            <Input id="description_th" name="description_th" defaultValue={shop.description_th || ''} className="h-12 rounded-xl bg-muted/30" placeholder="เช่น รสชาติจัดจ้าน ตำนานความอร่อยกว่า 30 ปี" />
          </div>
          <div className="space-y-2">
             <Label htmlFor="description_en" className="font-semibold">คำอธิบายร้านค้า / สโลแกน (ภาษาอังกฤษ)</Label>
             <Input id="description_en" name="description_en" defaultValue={shop.description_en || ''} className="h-12 rounded-xl bg-muted/30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
             <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">เบอร์โทรศัพท์ติดต่อ</Label>
                <Input id="phone" name="phone" defaultValue={shop.phone || ''} className="h-12 rounded-xl bg-muted/30" placeholder="08X-XXX-XXXX" />
             </div>
             <div className="space-y-2">
                <Label htmlFor="currency" className="font-semibold">สกุลเงิน</Label>
                <Input id="currency" name="currency" defaultValue={shop.currency || '฿'} className="h-12 rounded-xl bg-muted/30" />
                <p className="text-xs text-muted-foreground">สัญลักษณ์สกุลเงินที่จะแสดงในเมนู เช่น ฿ หรือ THB</p>
             </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-12 px-8 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all">
          {isLoading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่าร้านค้า'}
        </Button>
      </div>
    </form>
  )
}
