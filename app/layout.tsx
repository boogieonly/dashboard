import './globals.css'

export const metadata = {
  title: 'Metalfama Dashboard',
  description: 'Gestão de Faturamento Comercial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  )
}
