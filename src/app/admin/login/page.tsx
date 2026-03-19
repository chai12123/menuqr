'use client'

import { useState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { Utensils } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(formData: FormData) {
    setIsLoading(true)
    const result = await login(formData)
    
    // login throws redirect if successful
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 font-sans">
      <Card className="w-full max-w-sm border-0 shadow-xl rounded-3xl">
        <CardHeader className="space-y-2 flex flex-col items-center text-center pb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Utensils className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">เข้าสู่ระบบหลังบ้าน</CardTitle>
          <CardDescription className="text-sm">
            กรุณากรอกอีเมลและรหัสผ่านเพื่อจัดการร้านค้าของคุณ
          </CardDescription>
        </CardHeader>
        <form action={handleLogin}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">อีเมล</Label>
              <Input id="email" name="email" type="email" placeholder="example@email.com" className="h-12 rounded-xl bg-muted/50" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">รหัสผ่าน</Label>
              <Input id="password" name="password" type="password" className="h-12 rounded-xl bg-muted/50" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button className="w-full h-12 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all" type="submit" disabled={isLoading}>
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
            <div className="text-sm text-center text-muted-foreground pt-4 border-t w-full">
              ยังไม่มีบัญชีใช่หรือไม่?{' '}
              <Link href="/admin/register" className="text-primary font-bold hover:underline">
                ลงทะเบียนเปิดร้าน
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
