import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UIDAI Analytics Dashboard',
  description: 'Advanced analytics dashboard for UIDAI Aadhaar data with ML insights and predictive analytics',
  keywords: 'UIDAI, Aadhaar, Analytics, Dashboard, Machine Learning, Government, Data Visualization',
  authors: [{ name: 'UIDAI Analytics Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}