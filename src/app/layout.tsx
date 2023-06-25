import Layout from '@/components/common/Layout'
import '../styles/globals.css'
import {  Montserrat } from 'next/font/google'

import { AccountProvider } from '@/context/accountContext';
import ToastContainer from '@/components/ToastContainer';
const montserrat = Montserrat({ subsets: ['latin'] })

export const metadata = {
  title: 'Encrypted Ethereum Email Manager',
  description: 'Encrypted Ethereum Email Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={montserrat.className} suppressHydrationWarning={true}>
     
          <AccountProvider >
              <Layout>
                <ToastContainer />
                {children}
              </Layout>
          </AccountProvider>
        
      </body>
    </html>
  )
}
