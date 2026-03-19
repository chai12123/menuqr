'use client'

import { useState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { Utensils, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลที่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน')
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  async function onSubmit(data: LoginValues) {
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)
    
    // login throws redirect if successful
    if (result?.error) {
       // Display specific error gracefully based on common supabase errors
      if (result.error.toLowerCase().includes('invalid login credentials')) {
        toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
      } else {
        toast.error(result.error)
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 font-sans selection:bg-primary/20">
      <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2.5rem] bg-background/95 backdrop-blur-xl">
        <CardHeader className="space-y-3 flex flex-col items-center text-center pb-6 pt-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-inner">
            <Utensils className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">เข้าสู่ระบบหลังบ้าน</CardTitle>
          <CardDescription className="text-sm font-medium">
            กรุณากรอกบัญชีและรหัสผ่านเพื่อเข้าไปจัดการร้านค้าของคุณ
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 px-10">
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="email" className="font-bold text-sm">อีเมล</Label>
              <Input 
                id="email" 
                type="email" 
                {...register('email')} 
                placeholder="example@email.com" 
                className={`h-14 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all px-5 ${errors.email ? 'border-destructive/50 focus:border-destructive' : ''}`} 
                autoFocus 
              />
              {errors.email && <p className="text-xs text-destructive font-semibold px-1 pt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password" className="font-bold text-sm">รหัสผ่าน</Label>
                {/* Future implementation: forgot password link can be added here */}
                {/* <button type="button" className="text-xs text-muted-foreground hover:text-primary font-semibold transition-colors">ลืมรหัสผ่าน?</button> */}
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  {...register('password')} 
                  className={`h-14 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all pl-5 pr-14 ${errors.password ? 'border-destructive/50 focus:border-destructive' : ''}`} 
                  placeholder="รหัสผ่านของคุณ" 
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-semibold px-1 pt-1">{errors.password.message}</p>}
            </div>
            
          </CardContent>

          <CardFooter className="flex flex-col space-y-5 px-10 pb-10 pt-2">
            <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.9)] hover:-translate-y-0.5 transition-all text-white" type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="animate-spin mr-2 h-6 w-6" /> กำลังเข้าสู่ระบบ...</> : 'เข้าสู่ระบบ'}
            </Button>
            
            <div className="text-sm font-semibold text-center text-muted-foreground pt-4 w-full">
              ยังไม่มีบัญชีใช่หรือไม่?{' '}
              <Link href="/admin/register" className="text-primary hover:text-orange-500 underline underline-offset-4 decoration-primary/30 hover:decoration-orange-500 transition-all">
                ลงทะเบียนเปิดร้าน
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
