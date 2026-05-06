'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'

type DashboardShellProps = {
  children: React.ReactNode
}

const DashboardShell = ({ children }: DashboardShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const handleToggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="flex min-h-screen bg-app-bg">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="메뉴 닫기"
          onClick={handleCloseMobile}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-app-border bg-app-sidebar shadow-xl transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-64 lg:shrink-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        aria-label="주요 내비게이션"
      >
        <Sidebar onNavigate={handleCloseMobile} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-app-border bg-app-surface px-4 lg:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-app-border text-app-text hover:bg-slate-50"
            onClick={handleToggleMobile}
            aria-expanded={mobileOpen}
            aria-controls="app-sidebar-nav"
          >
            <span className="sr-only">메뉴 열기</span>
            <MenuIcon open={mobileOpen} />
          </button>
          <span className="text-sm font-semibold text-app-text">
            HanaLoop · 배출
          </span>
        </header>

        <main
          id="main-content"
          className="flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

const MenuIcon = ({ open }: { open: boolean }) => {
  if (open) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    )
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export { DashboardShell }
