'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/',
    label: '경영 대시보드',
    hint: '회사·월별 GHG',
  },
  {
    href: '/pcf',
    label: 'PCF 활동',
    hint: '원본 데이터·배출계수',
  },
  {
    href: '/posts',
    label: '게시글',
    hint: '회사별 노트',
  },
] as const

type SidebarProps = {
  onNavigate?: () => void
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const pathname = usePathname()

  const handleLinkClick = () => {
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-700/80 px-4 py-5">
        <Link
          href="/"
          className="block rounded-lg outline-none ring-app-accent-soft focus-visible:ring-2"
          onClick={handleLinkClick}
        >
          <p className="mt-1 text-lg font-semibold text-white">
            탄소 배출 대시보드
          </p>
        </Link>
      </div>

      <nav
        id="app-sidebar-nav"
        className="flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="앱 섹션"
      >
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/' || pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={[
                'block rounded-lg px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-app-accent-soft',
                isActive
                  ? 'bg-app-sidebar-hover text-white'
                  : 'text-app-sidebar-muted hover:bg-app-sidebar-hover hover:text-white',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-0.5 block text-xs opacity-70">{item.hint}</span>
            </Link>
          )
        })}
      </nav>

      <p className="border-t border-slate-700/80 px-4 py-3 text-xs text-slate-500">
        Net Zero 여정을 위한 배출·PCF 뷰
      </p>
    </div>
  )
}

export { Sidebar }
