"use client"

import * as React from "react"
import { FaHome, FaFileAlt, FaTrophy, FaComments, FaQuestionCircle, FaHistory, FaMapMarkerAlt, FaFileArchive, FaStickyNote, FaTools, FaRegClone, FaListAlt, FaSync, FaCog, FaEnvelope } from "react-icons/fa"
import { createClient } from "@/lib/supabase/client"

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
} from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/i18n/hooks"
import { ExamSwitcher } from "@/components/exam-switcher"

// Define new sidebar items based on the provided image
const menuItems = [
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

const revisionItems = [
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

const supportItems = [
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
}

export function AppSidebar({ user: propUser, ...props }: AppSidebarProps) {
  const { examType } = useExam();
  const { t, isLoaded: isTranslationLoaded } = useTranslation();
  const currentLanguage = EXAM_LANGUAGES[examType];
  const [user, setUser] = React.useState(propUser);
  const supabase = createClient();

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
    <Sidebar collapsible="icon" className="pb-[50px]" {...props}>
      <SidebarHeader>
        <div className="px-2 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-muted/50 rounded-lg">
            <ExamSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects 
          title="Menu" 
          projects={menuItems.map(item => ({
            ...item,
            name: isTranslationLoaded ? t(item.translationKey) : item.name,
          }))} 
          showActions={false}
        />
        <NavProjects 
          title="Revision" 
          projects={revisionItems.map(item => ({
            ...item,
            name: isTranslationLoaded ? t(item.translationKey) : item.name,
          }))} 
          showActions={false}
        />
        <NavProjects 
          title="Support" 
          projects={supportItems.map(item => ({
            ...item,
            name: isTranslationLoaded ? t(item.translationKey) : item.name,
          }))} 
          showActions={false}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

