import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Emissions Dashboard',
  description: '탄소 배출 · PCF 대시보드',
}
type RootLayoutProps = {
  children: React.ReactNode
}
const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
export default RootLayout
