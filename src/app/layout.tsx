import type { Metadata } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import '@/app/globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansThai = Noto_Sans_Thai({ subsets: ['thai', 'latin'], variable: '--font-noto' })

export const metadata: Metadata = {
  title: 'MenuQR - Modern Digital Menu',
  description: 'Create beautiful digital menus for your restaurant or cafe.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased text-foreground bg-background`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
