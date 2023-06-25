"use client";
import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import cn from 'classnames'

interface LayoutProps {
  children?: ReactNode
  className?: string
}
function Layout({ children, className }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
        <main className={cn('flex-grow flex flex-col ', className)}>
            {children}
        </main>
      <Footer />
    </div>
  )
}

export default Layout
