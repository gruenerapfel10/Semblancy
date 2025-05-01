"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useTranslation } from "@/lib/i18n/hooks"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { BookOpen, Headphones, Mic, PenTool } from "lucide-react"
import { useMemo } from "react"

export function PageIndicator() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  
  // Get the page info from the pathname and search params
  const pageInfo = useMemo(() => {
    if (pathname.includes("/practice/session")) {
      const skill = searchParams.get("skill")
      if (!skill) return null

      const skillInfo = {
        reading: { 
          name: t("nav.reading"), 
          icon: <BookOpen className="h-4 w-4" />,
          href: `/dashboard/practice/session?skill=reading`
        },
        writing: { 
          name: t("nav.writing"), 
          icon: <PenTool className="h-4 w-4" />,
          href: `/dashboard/practice/session?skill=writing`
        },
        listening: { 
          name: t("nav.listening"), 
          icon: <Headphones className="h-4 w-4" />,
          href: `/dashboard/practice/session?skill=listening`
        },
        speaking: { 
          name: t("nav.speaking"), 
          icon: <Mic className="h-4 w-4" />,
          href: `/dashboard/practice/session?skill=speaking`
        }
      }

      return skillInfo[skill as keyof typeof skillInfo] || null
    }
    return null
  }, [pathname, searchParams, t])
  
  // Only show for practice pages
  if (!pageInfo) {
    return null
  }
  
  return (
    <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-5 duration-300">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="hidden sm:inline-flex">
            {t("nav.dashboard")}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href={pageInfo.href} className="inline-flex items-center gap-1">
            {pageInfo.icon}
            <span className="hidden sm:inline">{pageInfo.name}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
  )
} 