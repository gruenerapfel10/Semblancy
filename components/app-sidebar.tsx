"use client"

import * as React from "react"
import { FaHome, FaFileAlt, FaTrophy, FaComments, FaQuestionCircle, FaHistory, FaMapMarkerAlt, FaFileArchive, FaStickyNote, FaTools, FaRegClone, FaListAlt, FaSync, FaCog, FaEnvelope } from "react-icons/fa"
import { createClient } from "@/lib/supabase/client"
import { usePathname } from "next/navigation"
import { useHotkeys } from "react-hotkeys-hook"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { useExam } from "@/lib/context/user-preferences-context"
import { EXAM_LANGUAGES } from "@/lib/exam/config"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/i18n/hooks"
import { ExamSwitcher } from "@/components/exam-switcher"
import { cn } from "@/lib/utils"

// Define new sidebar items with a more sophisticated styling approach
const menuItems = [
  {
    name: "Overview",
    translationKey: "sidebar.overview",
    url: "/dashboard/overview",
    icon: FaHome,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Overview of your progress and next steps",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Mocks",
    translationKey: "sidebar.mocks",
    url: "/dashboard/mocks",
    icon: FaFileAlt,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Practice mock exams",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Competition",
    translationKey: "sidebar.competition",
    url: "/dashboard/competition",
    icon: FaTrophy,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Compete with others",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Forums",
    translationKey: "sidebar.forums",
    url: "/dashboard/forums",
    icon: FaComments,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Join the discussion forums",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "How It Works",
    translationKey: "sidebar.howItWorks",
    url: "/dashboard/how-it-works",
    icon: FaQuestionCircle,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Learn how the platform works",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Changelog",
    translationKey: "sidebar.changelog",
    url: "/dashboard/changelog",
    icon: FaHistory,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "See recent updates",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Exam Centre Finder",
    translationKey: "sidebar.examCentreFinder",
    url: "/dashboard/exam-centre-finder",
    icon: FaMapMarkerAlt,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Find exam centres",
    actions: { view: false, share: false, delete: false }
  },
];

const revisionItems = [
  {
    name: "Past Papers",
    translationKey: "sidebar.pastPapers",
    url: "/dashboard/past-papers",
    icon: FaFileArchive,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Access past exam papers",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Notes",
    translationKey: "sidebar.notes",
    url: "/dashboard/notes",
    icon: FaStickyNote,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "View and create notes",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Skills",
    translationKey: "sidebar.skills",
    url: "/dashboard/skills",
    icon: FaTools,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Practice skills",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Flashcards",
    translationKey: "sidebar.flashcards",
    url: "/dashboard/flashcards",
    icon: FaRegClone,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Review flashcards",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Specifications",
    translationKey: "sidebar.specifications",
    url: "/dashboard/specifications",
    icon: FaListAlt,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "View exam specifications",
    actions: { view: false, share: false, delete: false }
  },
];

const supportItems = [
  {
    name: "Refresh",
    translationKey: "sidebar.refresh",
    url: "/dashboard/refresh",
    icon: FaSync,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Refresh the page",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Settings",
    translationKey: "sidebar.settings",
    url: "/dashboard/settings",
    icon: FaCog,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Customize your experience",
    actions: { view: false, share: false, delete: false }
  },
  {
    name: "Contact",
    translationKey: "sidebar.contact",
    url: "/dashboard/contact",
    icon: FaEnvelope,
    className: "text-foreground/80 group-hover:text-primary/90 group-hover:drop-shadow-sm transition-all duration-200",
    description: "Contact support",
    actions: { view: false, share: false, delete: false }
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

const categoryStyle = "text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1.5 mb-1.5";

export function AppSidebar({ user: propUser, ...props }: AppSidebarProps) {
  const { examType } = useExam();
  const { t, isLoaded: isTranslationLoaded } = useTranslation();
  const currentLanguage = EXAM_LANGUAGES[examType];
  const [user, setUser] = React.useState(propUser);
  const supabase = createClient();
  const pathname = usePathname();
  
  // Track whether the sidebar was originally collapsed
  const [wasCollapsed, setWasCollapsed] = React.useState(false);
  
  // Reference to the sidebar for mouse events
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  
  // Initialize with sidebar context
  const sidebar = useSidebar();
  
  // Track if hover expanded the sidebar
  const [expandedByHover, setExpandedByHover] = React.useState(false);
  
  // Add hotkey to toggle sidebar with Ctrl/Cmd+\
  useHotkeys(['meta+e', 'ctrl+e'], (event) => {
    event.preventDefault();
    event.stopPropagation();
    sidebar.setOpen(!sidebar.open);
  }, { enableOnFormTags: true });
  
  // Track initial collapse state when component mounts
  React.useEffect(() => {
    if (sidebar.state === 'collapsed') {
      setWasCollapsed(true);
    }
  }, []);
  
  // Handle mouse enter event
  const handleMouseEnter = React.useCallback(() => {
    if (sidebar.state === 'collapsed') {
      setExpandedByHover(true);
      sidebar.setOpen(true);
    }
  }, [sidebar]);
  
  // Handle mouse leave event
  const handleMouseLeave = React.useCallback(() => {
    if (expandedByHover) {
      setExpandedByHover(false);
      sidebar.setOpen(false);
    }
  }, [expandedByHover, sidebar]);
  
  // Update tracking state when sidebar is manually toggled
  React.useEffect(() => {
    // If user manually collapsed the sidebar, reset hover state
    if (sidebar.state === 'collapsed') {
      setExpandedByHover(false);
    }
    // If user manually expanded, it's no longer in "hover expanded" mode
    else if (sidebar.state === 'expanded' && !expandedByHover) {
      setWasCollapsed(false);
    }
  }, [sidebar.state, expandedByHover]);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.name || currentUser.email,
        });
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
        });
      } else {
        setUser(undefined);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Add active status to menu items based on current path
  const getItemsWithActiveStatus = (items: typeof menuItems) => {
    return items.map(item => ({
      ...item,
      active: pathname === item.url,
      className: cn(
        item.className,
        pathname === item.url && "text-primary font-medium"
      )
    }));
  };

  const menuItemsWithActive = getItemsWithActiveStatus(menuItems);
  const revisionItemsWithActive = getItemsWithActiveStatus(revisionItems);
  const supportItemsWithActive = getItemsWithActiveStatus(supportItems);

  const userData = user ? {
    name: user.name || user.email || 'User',
    email: user.email || '',
    avatar: "/avatars/default.jpg",
  } : {
    name: "Guest",
    email: "",
    avatar: "/avatars/default.jpg",
  };

  return (
    <Sidebar 
      ref={sidebarRef}
      collapsible="icon"
      variant="inset"
      side="left"
      className="relative h-full pb-[50px] bg-sidebar/30 backdrop-blur-sm border-r border-border/30 shadow-md transition-all duration-150" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <SidebarHeader className="border-b border-border/20 pb-4">
        <div className="px-2 py-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-lg">
            <ExamSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1.5 py-3 space-y-7">
        <NavProjects 
          title={<div className={categoryStyle}>Menu</div>} 
          projects={menuItemsWithActive.map(item => ({
            ...item,
            name: isTranslationLoaded ? t(item.translationKey) : item.name,
          }))} 
          showActions={false}
          className="pb-5 space-y-1"
        />
        <NavProjects 
          title={<div className={categoryStyle}>Revision</div>} 
          projects={revisionItemsWithActive.map(item => ({
            ...item,
            name: isTranslationLoaded ? t(item.translationKey) : item.name,
          }))} 
          showActions={false}
          className="pb-5 space-y-1"
        />
        <NavProjects 
          title={<div className={categoryStyle}>Support</div>} 
          projects={supportItemsWithActive.map(item => ({
            ...item,
            name: isTranslationLoaded ? t(item.translationKey) : item.name,
          }))} 
          showActions={false}
          className="space-y-1"
        />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/20 mt-auto bg-background/50 backdrop-blur-sm">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

