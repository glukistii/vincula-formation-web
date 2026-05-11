import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vincula Formation - Lecteur Vidéo',
  description: 'Plateforme de formations vidéo et e-commerce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
