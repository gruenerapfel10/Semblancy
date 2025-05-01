"use client"

import { SidebarTrigger } from "@/components/sidebar-trigger"

interface SiteHeaderProps {
  children?: React.ReactNode
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center p-4">
        <SidebarTrigger />
        <div className="mx-4 flex-1 overflow-hidden">
          {Array.isArray(children) && children.length > 0 && children[0]}
        </div>
        <div className="flex items-center justify-end gap-2">
          {Array.isArray(children) && children.slice(1)}
          {!Array.isArray(children) && children}
        </div>
      </div>
    </header>
  )
}
