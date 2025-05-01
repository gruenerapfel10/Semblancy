"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Trophy,
  Users,
  MessageCircle,
  History,
  FileText,
  StickyNote,
  Wrench,
  Layers,
  ClipboardList,
  Mail,
  HelpCircle,
  RefreshCw,
  Book,
  Star,
  Search,
  User,
  FileStack,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: PieChart,
    },
    {
      title: "Mocks",
      url: "/dashboard/mocks",
      icon: BookOpen,
    },
    {
      title: "Competition",
      url: "/dashboard/competition",
      icon: Trophy,
    },
    {
      title: "Forums",
      url: "/dashboard/forums",
      icon: MessageCircle,
    },
    {
      title: "Memory Maps",
      url: "/dashboard/memory-maps",
      icon: Layers,
    },
    {
      title: "How It Works",
      url: "/dashboard/how-it-works",
      icon: HelpCircle,
    },
    {
      title: "Changelog",
      url: "/dashboard/changelog",
      icon: History,
    },
    {
      title: "Exam Centre Finder",
      url: "/dashboard/exam-centre-finder",
      icon: Search,
    },
  ],
  navRevision: [
    {
      title: "Past Papers",
      url: "/dashboard/past-papers",
      icon: FileText,
    },
    {
      title: "Notes",
      url: "/dashboard/notes",
      icon: StickyNote,
    },
    {
      title: "Skills",
      url: "/dashboard/skills",
      icon: Wrench,
    },
    {
      title: "Flashcards",
      url: "/dashboard/flashcards",
      icon: Layers,
    },
    {
      title: "Specifications",
      url: "/dashboard/specifications",
      icon: ClipboardList,
    },
  ],
  navSupport: [
    {
      title: "Refresh",
      url: "#",
      icon: RefreshCw,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      title: "Contact",
      url: "/dashboard/contact",
      icon: Mail,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Semblancy</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.navRevision} />
        <NavSecondary items={data.navSupport} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
