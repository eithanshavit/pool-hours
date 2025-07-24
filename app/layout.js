import './globals.css'

export const metadata = {
  title: 'Highlands Pool Hours',
  description: 'Real-time pool availability at Highlands Recreation District',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏊‍♂️</text></svg>',
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
