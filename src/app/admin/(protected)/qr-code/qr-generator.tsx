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
    toast.success('Link copied to clipboard')
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customization</CardTitle>
            <CardDescription>Adjust the appearance of your QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Foreground Color</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1 h-10" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1 h-10" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </div>
            </div>
            {shop.logo_url && (
              <div className="flex items-center justify-between pt-2 border-t">
                <Label>Include Shop Logo</Label>
                <Switch checked={includeLogo} onCheckedChange={setIncludeLogo} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={url} readOnly />
              <Button variant="secondary" onClick={copyUrl}><Copy className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="preview">Code Preview</TabsTrigger>
            <TabsTrigger value="print">Print Layout</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 space-y-8">
                <div className="bg-white p-4 rounded-xl shadow-md border" style={{ backgroundColor: bgColor }}>
                  <QRCodeCanvas 
                    id="qr-canvas"
                    value={url} 
                    size={280} 
                    fgColor={fgColor} 
                    bgColor={bgColor} 
                    level="H"
                    imageSettings={imageSettings}
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
                
                <div className="flex gap-4">
                  <Button onClick={downloadPng} className="bg-primary hover:bg-primary/90">
                    <Download className="mr-2 h-4 w-4" /> Download PNG
                  </Button>
                  <Button variant="outline" onClick={downloadSvg}>
                    <Download className="mr-2 h-4 w-4" /> Download SVG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="print" className="mt-4">
            <Card>
              <CardContent className="p-8 flex justify-center bg-muted/30 print:bg-transparent print:p-0">
                <div className="w-[300px] aspect-[1/1.414] bg-white shadow-xl flex flex-col items-center justify-between p-8 border print:shadow-none">
                  <div className="text-center space-y-2">
                    {shop.logo_url && <img src={shop.logo_url} alt="Logo" className="w-16 h-16 rounded-full mx-auto object-cover" />}
                    <h2 className="text-xl font-bold">{shop.name_th}</h2>
                    <p className="text-muted-foreground text-sm">Scan to view our menu</p>
                  </div>
                  
                  <div className="p-2 border-2 border-dashed rounded-xl">
                     <QRCodeCanvas 
                      value={url} 
                      size={180} 
                      fgColor={fgColor} 
                      bgColor={bgColor} 
                      level="H"
                      imageSettings={imageSettings}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    Enjoy your meal!
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted p-4 justify-center border-t print:hidden">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print Card (A6)
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
