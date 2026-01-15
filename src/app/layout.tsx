import './globals.css'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BCH P2P - Bitcoin Cash Peer to Peer Trading',
  description: 'Trade Bitcoin Cash peer to peer with secure escrow and instant transactions',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}