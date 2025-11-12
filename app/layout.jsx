"use client"

import React from "react"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: "Kana Sensei CMS",
  description: "Admin interface for Kana Sensei",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
