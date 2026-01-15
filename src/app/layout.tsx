import './globals.css'
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'BCH P2P - Bitcoin Cash Peer to Peer Trading',
  description: 'Trade Bitcoin Cash peer to peer with secure escrow and instant transactions',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-black text-white antialiased">
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
    </html>
  )
}