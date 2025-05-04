"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTranslation } from "@/lib/i18n/hooks"
import { FaHome, FaFileAlt, FaTrophy, FaComments, FaQuestionCircle, FaHistory, FaMapMarkerAlt, FaFileArchive, FaStickyNote, FaTools, FaRegClone, FaListAlt, FaSync, FaCog, FaEnvelope } from "react-icons/fa"

// Define menu items locally since they're not exported from app-sidebar
type MenuItem = {
  name: string;
  translationKey: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
  description?: string;
  active?: boolean;
  actions?: { view: boolean; share: boolean; delete: boolean };
}

const menuItems: MenuItem[] = [
  {
    name: "Overview",
    translationKey: "sidebar.overview",
    url: "/dashboard/overview",
    icon: FaHome,
    description: "Overview of your progress and next steps",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Mocks",
    translationKey: "sidebar.mocks",
    url: "/dashboard/mocks",
    icon: FaFileAlt,
    description: "Practice mock exams",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Competition",
    translationKey: "sidebar.competition",
    url: "/dashboard/competition",
    icon: FaTrophy,
    description: "Compete with others",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Forums",
    translationKey: "sidebar.forums",
    url: "/dashboard/forums",
    icon: FaComments,
    description: "Join the discussion forums",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "How It Works",
    translationKey: "sidebar.howItWorks",
    url: "/dashboard/how-it-works",
    icon: FaQuestionCircle,
    description: "Learn how the platform works",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Changelog",
    translationKey: "sidebar.changelog",
    url: "/dashboard/changelog",
    icon: FaHistory,
    description: "See recent updates",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Exam Centre Finder",
    translationKey: "sidebar.examCentreFinder",
    url: "/dashboard/exam-centre-finder",
    icon: FaMapMarkerAlt,
    description: "Find exam centres",
    actions: { view: false, share: false, delete: false }
  },
];

const revisionItems: MenuItem[] = [
  {
    name: "Past Papers",
    translationKey: "sidebar.pastPapers",
    url: "/dashboard/past-papers",
    icon: FaFileArchive,
    description: "Access past exam papers",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Notes",
    translationKey: "sidebar.notes",
    url: "/dashboard/notes",
    icon: FaStickyNote,
    description: "View and create notes",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Skills",
    translationKey: "sidebar.skills",
    url: "/dashboard/skills",
    icon: FaTools,
    description: "Practice skills",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Flashcards",
    translationKey: "sidebar.flashcards",
    url: "/dashboard/flashcards",
    icon: FaRegClone,
    description: "Review flashcards",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Specifications",
    translationKey: "sidebar.specifications",
    url: "/dashboard/specifications",
    icon: FaListAlt,
    description: "View exam specifications",
    actions: { view: false, share: false, delete: false }
  },
];

const supportItems: MenuItem[] = [
  {
    name: "Refresh",
    translationKey: "sidebar.refresh",
    url: "/dashboard/refresh",
    icon: FaSync,
    description: "Refresh the page",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Settings",
    translationKey: "sidebar.settings",
    url: "/dashboard/settings",
    icon: FaCog,
    description: "Customize your experience",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Contact",
    translationKey: "sidebar.contact",
    url: "/dashboard/contact",
    icon: FaEnvelope,
    description: "Contact support",
    actions: { view: false, share: false, delete: false }
  },
];

interface CommandSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter()
  const { t, isLoaded } = useTranslation()
  
  // If we don't receive props, manage state internally
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  // Only use hotkeys if we're managing our own state
  useHotkeys(['meta+k', 'ctrl+k'], (event) => {
    if (onOpenChange === undefined) {
      event.preventDefault()
      event.stopPropagation()
      setInternalOpen((prev) => !prev)
    }
  }, { enableOnFormTags: true })

  const allItems = [
    { title: "Menu", items: menuItems },
    { title: "Revision", items: revisionItems },
    { title: "Support", items: supportItems },
  ]

  const runCommand = React.useCallback((command: () => unknown) => {
    setIsOpen(false)
    command()
  }, [setIsOpen])

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput
        placeholder={isLoaded ? t("command.searchPlaceholder") : "Search for pages..."}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {allItems.map((section) => (
          <React.Fragment key={section.title}>
            <CommandGroup heading={section.title}>
              {section.items.map((item: MenuItem) => (
                <CommandItem
                  key={item.url}
                  onSelect={() => runCommand(() => router.push(item.url))}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{isLoaded ? t(item.translationKey) : item.name}</span>
                  {item.url === "/dashboard/settings" && (
                    <CommandShortcut>⌘S</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
} 