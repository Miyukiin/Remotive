import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Providers from "@/components/providers"
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./globals.css";                                   

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Remotive | A Project Management Tool",
  description: "Remotive is the premier team collaboration and project management platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en" /*className="dark"*/ suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster richColors position="top-right"/>
        <ThemeProvider><Providers>{children}</Providers></ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  )
}
