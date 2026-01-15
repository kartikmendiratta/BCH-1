'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0/client'
import { LayoutDashboard, ShoppingCart, Wallet, FileText, LogOut } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/invoices', label: 'Invoices', icon: FileText },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            BCH P2P
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-neutral-800 text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400 hidden sm:block">
              {user?.email}
            </span>
            <a 
              href="/auth/logout"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <LogOut size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  isActive ? 'text-white' : 'text-neutral-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}