"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n/hooks"
import React from "react"
import { cn } from "@/lib/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
  title,
  showMore = false,
  showActions = false,
  className,
}: {
  projects: {
    name: string
    url: string
    icon: React.ElementType
    iconColor?: string
    className?: string
    actions?: {
      view?: boolean
      share?: boolean
      delete?: boolean
    }
  }[]
  title?: React.ReactNode | string
  showMore?: boolean
  showActions?: boolean
  className?: string
}) {
  const { isMobile } = useSidebar()
  const { t } = useTranslation()

  return (
    <SidebarGroup className={className}>
      {typeof title === 'string' ? (
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
          {title ? t(title) : t('sidebar.study')}
        </SidebarGroupLabel>
      ) : (
        <div className="group-data-[collapsible=icon]:hidden">{title}</div>
      )}
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton 
              asChild 
              tooltip={t(item.name)}
              className={cn("group", item.className)}
            >
              <a href={item.url}>
                {item.iconColor ? (
                  <item.icon style={{ color: item.iconColor }} />
                ) : (
                  <item.icon />
                )}
                <span>{t(item.name)}</span>
              </a>
            </SidebarMenuButton>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">{t('common.more')}</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  {item.actions?.view !== false && (
                    <DropdownMenuItem>
                      <Folder className="text-muted-foreground" />
                      <span>{t('sidebar.viewProject')}</span>
                    </DropdownMenuItem>
                  )}
                  {item.actions?.share !== false && (
                    <DropdownMenuItem>
                      <Forward className="text-muted-foreground" />
                      <span>{t('sidebar.shareProject')}</span>
                    </DropdownMenuItem>
                  )}
                  {(item.actions?.view !== false || item.actions?.share !== false) && item.actions?.delete !== false && (
                    <DropdownMenuSeparator />
                  )}
                  {item.actions?.delete !== false && (
                    <DropdownMenuItem>
                      <Trash2 className="text-muted-foreground" />
                      <span>{t('sidebar.deleteProject')}</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        ))}
        {showMore && (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal className="text-sidebar-foreground/70" />
              <span>{t('common.more')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
