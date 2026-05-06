import { DashboardShell } from '@/components/layout/DashboardShell'

type ShellLayoutProps = {
  children: React.ReactNode
}

const ShellLayout = ({ children }: ShellLayoutProps) => {
  return <DashboardShell>{children}</DashboardShell>
}

export default ShellLayout
