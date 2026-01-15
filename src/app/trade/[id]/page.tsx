'use client'

export default function TradePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Trade {params.id}</h1>
      <p className="text-neutral-400">Coming soon - Trade details and chat</p>
    </div>
  )
}