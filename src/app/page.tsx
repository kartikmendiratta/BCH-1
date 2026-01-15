'use client'

import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'
import Button from '@/components/ui/Button'
import { ArrowRight, Shield, Globe, Zap } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useUser()

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold">BCH P2P</span>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <a href="/api/auth/login">
                  <Button variant="ghost">Login</Button>
                </a>
                <a href="/api/auth/login">
                  <Button>Get Started</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Trade Bitcoin Cash
        </h1>
        <p className="text-xl text-neutral-400 mb-12 max-w-3xl mx-auto">
          Peer-to-peer Bitcoin Cash trading with secure escrow, multi-currency support, and instant settlements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <Link href="/marketplace">
                <Button size="lg">
                  Start Trading
                  <ArrowRight size={18} className="ml-2 inline" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="secondary" size="lg">
                  View Offers
                </Button>
              </Link>
            </>
          ) : (
            <>
              <a href="/api/auth/login">
                <Button size="lg">
                  Start Trading
                  <ArrowRight size={18} className="ml-2 inline" />
                </Button>
              </a>
              <Link href="/marketplace">
                <Button variant="secondary" size="lg">
                  View Offers
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-neutral-800 rounded-xl p-8">
            <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Escrow</h3>
            <p className="text-neutral-400">
              Smart contract escrow protects both buyers and sellers during every trade.
            </p>
          </div>

          <div className="border border-neutral-800 rounded-xl p-8">
            <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4">
              <Globe size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Currency</h3>
            <p className="text-neutral-400">
              Trade in USD, EUR, INR and more. Use your preferred payment method.
            </p>
          </div>

          <div className="border border-neutral-800 rounded-xl p-8">
            <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4">
              <Zap size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Invoice System</h3>
            <p className="text-neutral-400">
              Create BCH invoices for your business. Get paid instantly with QR codes.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Find an Offer', desc: 'Browse buy or sell offers from other users' },
            { step: '02', title: 'Start Trade', desc: 'BCH is locked in secure escrow automatically' },
            { step: '03', title: 'Complete', desc: 'Confirm payment and receive your BCH' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="text-4xl font-bold text-neutral-700 mb-4">{item.step}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-neutral-500 text-sm">
          © 2026 BCH P2P Exchange. Built for hackathon.
        </div>
      </footer>
    </div>
  )
}