'use client'

import { useState } from 'react'
import { signup } from '../actions'
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

const registerSchema = z.object({
  fullName: z.string().min(2, 'ชื่อร้านค้าต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' }
  })

  // Watch password value for strength indicator
  const passwordValue = watch('password') || ''
  
  // Basic strength calculation: max 100%. Weak < 6, Med >= 6, Strong >= 8 + special char
  let strengthPercent = 0
  let strengthColor = 'bg-muted'
  let strengthLabel = ''
  
  if (passwordValue.length > 0) {
    if (passwordValue.length < 6) {
      strengthPercent = 33
      strengthColor = 'bg-destructive'
      strengthLabel = 'รหัสผ่านค่อนข้างเดาง่าย'
    } else if (passwordValue.length >= 8 && /[!@#$%^&*0-9]/.test(passwordValue) && /[A-Z]/.test(passwordValue)) {
      strengthPercent = 100
      strengthColor = 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
      strengthLabel = 'รหัสผ่านเดายากมาก'
    } else {
      strengthPercent = 66
      strengthColor = 'bg-amber-400'
      strengthLabel = 'รหัสผ่านเดายากพอใช้'
    }
  }

  async function onSubmit(data: RegisterValues) {
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('fullName', data.fullName)
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await signup(formData)
    
    // signup throws redirect if successful
    if (result?.error) {
      toast.error(result.error)
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
          <CardTitle className="text-3xl font-black tracking-tight text-foreground">เปิดร้านค้าใหม่</CardTitle>
          <CardDescription className="text-sm font-medium">
            กรอกข้อมูลด้านล่างเพื่ออัปเกรดร้านของคุณสู่โลกดิจิทัลฟรี!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 px-10">
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="fullName" className="font-bold text-sm">ชื่อร้านค้า (หรือชื่อผู้ดูแล) *</Label>
              <Input 
                id="fullName" 
                {...register('fullName')} 
                placeholder="ร้านอาหารอร่อย 99" 
                className={`h-14 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all px-5 ${errors.fullName ? 'border-destructive/50 focus:border-destructive' : ''}`} 
                autoFocus 
              />
              {errors.fullName && <p className="text-xs text-destructive font-semibold px-1 pt-1">{errors.fullName.message}</p>}
            </div>
            
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="email" className="font-bold text-sm">อีเมล *</Label>
              <Input 
                id="email" 
                type="email" 
                {...register('email')} 
                placeholder="example@email.com" 
                className={`h-14 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all px-5 ${errors.email ? 'border-destructive/50 focus:border-destructive' : ''}`} 
              />
              {errors.email && <p className="text-xs text-destructive font-semibold px-1 pt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="password" className="font-bold text-sm flex justify-between">
                <span>รหัสผ่าน *</span>
                {strengthLabel && <span className={`text-[10px] font-bold ${strengthPercent === 100 ? 'text-green-600' : strengthPercent === 33 ? 'text-destructive' : 'text-amber-600'}`}>{strengthLabel}</span>}
              </Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  {...register('password')} 
                  className={`h-14 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all pl-5 pr-14 ${errors.password ? 'border-destructive/50 focus:border-destructive' : ''}`} 
                  placeholder="ความยาวอย่างน้อย 6 ตัวอักษร" 
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Bar */}
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full transition-all duration-500 ease-out rounded-full ${strengthColor}`} 
                  style={{ width: `${strengthPercent}%` }} 
                />
              </div>
              {errors.password && <p className="text-xs text-destructive font-semibold px-1 pt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <Label htmlFor="confirmPassword" className="font-bold text-sm">ยืนยันรหัสผ่านอีกครั้ง *</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  {...register('confirmPassword')} 
                  className={`h-14 rounded-2xl bg-muted/40 border-2 border-transparent hover:border-border focus:border-primary focus:bg-background transition-all pl-5 pr-14 ${errors.confirmPassword ? 'border-destructive/50 focus:border-destructive' : ''}`} 
                  placeholder="พิมพ์รหัสผ่านเดิมซ้ำอีกรอบ" 
                />
                <button 
                  type="button" 
                  className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive font-semibold px-1 pt-1">{errors.confirmPassword.message}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-5 px-10 pb-10 pt-2">
            <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-[0_0_20px_-5px_rgba(249,115,22,0.6)] hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.9)] hover:-translate-y-0.5 transition-all text-white" type="submit" disabled={isLoading}>
              {isLoading ? <><Loader2 className="animate-spin mr-2 h-6 w-6" /> กำลังสร้างบัญชี...</> : 'สร้างบัญชีร้านค้า'}
            </Button>
            
            <div className="text-sm font-semibold text-center text-muted-foreground pt-4 w-full">
              มีบัญชีอยู่แล้วใช่หรือไม่?{' '}
              <Link href="/admin/login" className="text-primary hover:text-orange-500 underline underline-offset-4 decoration-primary/30 hover:decoration-orange-500 transition-all">
                เข้าสู่ระบบที่นี่
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
