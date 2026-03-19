'use client'
import { useState } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, Printer } from 'lucide-react'
import { toast } from 'sonner'

export function QrGenerator({ shop, baseUrl }: { shop: any, baseUrl: string }) {
  const url = `${baseUrl}/menu/${shop.slug}`
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [includeLogo, setIncludeLogo] = useState(false)
  
  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    toast.success('คัดลอกลิงก์เรียบร้อยแล้ว')
  }

  const downloadPng = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (!canvas) return
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${shop.slug}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  const downloadSvg = () => {
    const svg = document.getElementById('qr-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const domUrl = URL.createObjectURL(blob);
    let downloadLink = document.createElement("a");
    downloadLink.href = domUrl;
    downloadLink.download = `${shop.slug}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  const imageSettings = includeLogo && shop.logo_url ? {
    src: shop.logo_url,
    height: 60,
    width: 60,
    excavate: true,
  } : undefined

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
      <div className="lg:col-span-1 space-y-6">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">ปรับแต่งคิวอาร์โค้ด</CardTitle>
            <CardDescription className="text-sm">เลือกสีสันให้เข้ากับแบรนด์ร้านของคุณ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-3">
              <Label className="font-semibold text-foreground">สีของคิวอาร์โค้ด</Label>
              <div className="flex gap-3">
                <Input type="color" className="w-16 p-1 h-12 rounded-xl border-2 cursor-pointer" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-12 rounded-xl bg-muted/50 font-mono" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="font-semibold text-foreground">สีพื้นหลัง</Label>
              <div className="flex gap-3">
                <Input type="color" className="w-16 p-1 h-12 rounded-xl border-2 cursor-pointer" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-12 rounded-xl bg-muted/50 font-mono" />
              </div>
            </div>
            {shop.logo_url && (
              <div className="flex items-center justify-between pt-6 border-t">
                <Label className="font-semibold text-foreground cursor-pointer" onClick={() => setIncludeLogo(!includeLogo)}>แนบโลโก้ของร้านไว้ตรงกลาง</Label>
                <Switch checked={includeLogo} onCheckedChange={setIncludeLogo} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">ลิงก์เมนูออนไลน์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={url} readOnly className="h-12 rounded-xl bg-muted/50 font-mono text-sm" />
              <Button onClick={copyUrl} className="h-12 px-5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg"><Copy className="h-5 w-5" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/50 p-1.5 rounded-2xl h-14">
            <TabsTrigger value="preview" className="rounded-xl font-bold text-base data-[state=active]:shadow-sm">ตัวอย่างคิวอาร์โค้ด</TabsTrigger>
            <TabsTrigger value="print" className="rounded-xl font-bold text-base data-[state=active]:shadow-sm">รูปแบบป้ายตั้งโต๊ะ (พิมพ์)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-8 sm:p-14 space-y-8 bg-gradient-to-b from-card to-muted/20">
                <div className="p-6 sm:p-8 rounded-3xl shadow-xl border border-border/30" style={{ backgroundColor: bgColor }}>
                  <QRCodeCanvas 
                    id="qr-canvas"
                    value={url} 
                    size={280} 
                    fgColor={fgColor} 
                    bgColor={bgColor} 
                    level="H"
                    imageSettings={imageSettings}
                    className="w-full h-auto max-w-[280px]"
                  />
                  {/* Invisible SVG for download */}
                  <div className="hidden">
                    <QRCodeSVG 
                      id="qr-svg"
                      value={url} 
                      size={280} 
                      fgColor={fgColor} 
                      bgColor={bgColor} 
                      level="H"
                      imageSettings={imageSettings}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <Button onClick={downloadPng} className="bg-primary hover:bg-primary/90 h-14 px-8 rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                    <Download className="mr-2 h-5 w-5" /> ดาวน์โหลด .PNG
                  </Button>
                  <Button variant="outline" onClick={downloadSvg} className="h-14 px-8 rounded-full font-bold text-base border-2 hover:bg-muted w-full sm:w-auto">
                    <Download className="mr-2 h-5 w-5" /> ดาวน์โหลด .SVG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="print" className="mt-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-8 sm:p-12 flex justify-center bg-muted/30 print:bg-transparent print:p-0">
                <div className="w-full max-w-[320px] aspect-[1/1.414] bg-white shadow-2xl rounded-2xl flex flex-col items-center justify-between p-10 border border-border/20 print:shadow-none print:border-none print:rounded-none">
                  <div className="text-center space-y-3 w-full">
                    {shop.logo_url && <img src={shop.logo_url} alt="Logo" className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-muted shadow-sm" />}
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{shop.name_th}</h2>
                    <div className="w-12 h-1 bg-primary/30 rounded-full mx-auto mt-2"></div>
                    <p className="text-slate-500 font-semibold text-sm pt-2">สแกนเพื่อดูเมนูอาหาร</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-2xl shadow-sm border">
                     <QRCodeCanvas 
                      value={url} 
                      size={200} 
                      fgColor={fgColor} 
                      bgColor={bgColor} 
                      level="H"
                      imageSettings={imageSettings}
                    />
                  </div>
                  
                  <div className="text-sm font-bold text-slate-400 text-center tracking-wide">
                    ขอให้อร่อยกับมื้ออาหารของคุณ!
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-6 justify-center border-t rounded-b-3xl print:hidden">
                <Button variant="outline" onClick={() => window.print()} className="h-14 px-8 rounded-full font-bold text-base border-2 hover:bg-background">
                  <Printer className="mr-2 h-5 w-5" /> พิมพ์ป้ายตั้งโต๊ะ (A6)
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
