import './globals.css'

export const metadata = {
  title: 'Highlands Pool Hours',
  description: 'Real-time pool availability at Highlands Recreation District',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 
