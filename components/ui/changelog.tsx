"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FiPackage, FiSmartphone, FiBarChart2, FiFlag } from 'react-icons/fi';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { CheckCircleFillIcon } from "@/components/icons";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  description: string;
  items?: string[];
  image?: string;
};

export interface Changelog1Props {
  title?: string;
  description?: string;
  entries?: ChangelogEntry[];
  className?: string;
}

const Changelog1 = ({
  title = "Changelog",
  description = "Get the latest updates and improvements to our platform.",
  entries = defaultChangelogData,
}: Changelog1Props) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollIndicator, setScrollIndicator] = useState({ top: 0, height: 40 });

  // You can use a Tailwind color or currentColor for the indicator
  const indicatorColor = 'var(--foreground)';

  // Throttle function
  function throttle(fn: (...args: any[]) => void, wait: number) {
    let last = 0;
    let timeout: any = null;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn(...args);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          last = Date.now();
          fn(...args);
        }, wait - (now - last));
      }
    };
  }

  // Intersection Observer to track which entry is in view
  useEffect(() => {
    const handleScroll = throttle(() => {
      const container = containerRef.current;
      if (!container) return;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      // Calculate indicator position and height
      const indicatorHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 40);
      const indicatorTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - indicatorHeight);
      setScrollIndicator(prev => {
        if (prev.top !== indicatorTop || prev.height !== indicatorHeight) {
          return {
            top: isNaN(indicatorTop) ? 0 : indicatorTop,
            height: isNaN(indicatorHeight) ? 40 : indicatorHeight,
          };
        }
        return prev;
      });
      // Scroll spy logic
      const offsets = entryRefs.current.map(ref => {
        if (!ref) return Infinity;
        return ref.offsetTop;
      });
      const offset = 32;
      let active = 0;
      for (let i = 0; i < offsets.length; i++) {
        if (scrollTop + offset >= offsets[i]) {
          active = i;
        }
      }
      setActiveIdx(prev => (prev !== active ? active : prev));
    }, 60); // 60ms throttle
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [entries.length]);

  // Memoize scrollToEntry
  const scrollToEntry = useCallback((idx: number) => {
    entryRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <TooltipProvider>
      <section className="w-full h-screen max-h-screen bg-background relative overflow-hidden" aria-label="Changelog">
        <div className="w-full h-full max-w-[1800px] mx-auto flex flex-col md:flex-row" style={{height: '100%'}}>
          {/* Fixed Sidebar */}
          <aside
            className="hidden md:flex flex-col bg-background z-10"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '30%',
              height: '100%',
              padding: '3rem 3.5rem 3rem 3.5rem',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
            aria-label="Product Updates Navigation"
          >
            <h1 className="text-3xl font-extrabold tracking-tight mb-8 text-foreground">Product Updates</h1>
            <div className="relative flex-1 flex flex-col w-full">
              {/* Vertical timeline line - center of buttons */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border rounded-full" style={{zIndex: 0}} />
              {/* Subtle scroll indicator */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-0.5 rounded-full bg-[hsl(var(--brand)/0.15)]"
                style={{ top: scrollIndicator.top, height: scrollIndicator.height, zIndex: 1 }}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <nav className="flex flex-col gap-6 w-full z-10 pt-2 pb-2" role="navigation" aria-label="Changelog entries">
                {entries.map((entry, idx) => {
                  const isActive = activeIdx === idx;
                  let Icon = FiPackage;
                  if (idx === 1) Icon = FiSmartphone;
                  if (idx === 2) Icon = FiBarChart2;
                  if (idx === entries.length - 1) Icon = FiFlag;
                  return (
                    <button
                      key={entry.version}
                      onClick={() => scrollToEntry(idx)}
                      className={`group relative flex items-start gap-4 w-full focus:outline-none transition-all duration-200
                        ${isActive ? 'scale-[1.02] shadow bg-muted' : 'hover:scale-[1.01] hover:shadow-sm hover:bg-muted/60'}
                      `}
                      style={{ borderRadius: '1rem', minHeight: 80 }}
                      tabIndex={0}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {/* Subtle active bar highlight */}
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-0.5 rounded-full transition-all duration-200 ${isActive ? 'bg-[hsl(var(--brand)/0.5)]' : ''}`} style={{zIndex: 2}} />
                      {/* Animated Icon Background with Tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute -left-5 -top-3 flex items-center justify-center w-10 h-10 aspect-square rounded-xl text-xl transition-all duration-300 z-20
                              ${idx === 0
                                ? "bg-[hsl(var(--brand-tint-1)/0.15)] text-[hsl(var(--brand))] shadow"
                                : isActive
                                  ? "bg-muted text-[hsl(var(--brand))] shadow"
                                  : "bg-muted text-muted-foreground group-hover:scale-105 group-hover:shadow-sm"}
                            `}
                            style={{ boxShadow: isActive ? '0 0 0 2px hsl(var(--brand)/0.15)' : undefined }}
                            aria-label={entry.title}
                          >
                            <Icon size={24} className="w-6 h-6 transition-transform duration-200 group-hover:scale-110 group-active:scale-95" style={{display: 'block'}} />
                            {isActive && <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[hsl(var(--brand)/0.7)] animate-pulse border-2 border-white" />}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">{entry.title}</TooltipContent>
                      </Tooltip>
                      {/* Button content with left padding for icon */}
                      <span
                        className={`flex flex-col items-start border border-border rounded-xl px-6 py-3 w-full text-left transition-colors duration-200 pl-8
                          ${isActive ? 'ring-2 ring-[hsl(var(--brand)/0.12)]' : 'group-hover:ring-2 group-hover:ring-primary/10 bg-card'}
                        `}
                        style={{ minHeight: 64 }}
                      >
                        <span className="text-xs text-muted-foreground font-medium mb-0.5 tracking-wide">{entry.date}</span>
                        <span className={`text-base font-bold transition-colors duration-200 ${isActive ? 'text-[hsl(var(--brand))]' : 'text-foreground'}`}>{entry.title}</span>
                        <span className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">{entry.description}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Scrollable Main Content */}
          <main
            ref={containerRef}
            className="flex-1 min-w-0 h-full overflow-y-scroll flex flex-col gap-8 md:gap-12 px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-8"
            style={{
              marginLeft: '30%',
              width: '70%',
              maxHeight: '100%',
              boxSizing: 'border-box',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}
            aria-label="Changelog entries list"
          >
            <style>{`
              main::-webkit-scrollbar { display: none; }
            `}</style>
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.version}
                ref={el => { entryRefs.current[idx] = el; }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-10 w-full relative will-change-transform hover:scale-[1.01] hover:shadow-xl focus-within:scale-[1.01] focus-within:shadow-xl transition-transform duration-200"
                style={{ transform: 'translateZ(0)' }}
                tabIndex={0}
                aria-labelledby={`changelog-title-${idx}`}
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full border border-[hsl(var(--brand)/0.3)] text-[hsl(var(--brand))] bg-card">
                      {entry.version}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground tracking-wide">
                      {entry.date}
                    </span>
                  </div>
                  <h3 id={`changelog-title-${idx}`} className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight tracking-tight font-sans text-[hsl(var(--brand))]">
                    {entry.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed font-sans">
                    {entry.description}
                  </p>
                  {entry.items && entry.items.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="font-semibold text-base text-foreground tracking-wide font-sans">What's included</span>
                      </div>
                      <ol className="flex flex-col gap-2">
                        {entry.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-4 group transition-transform">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--brand-tint-1)/0.18)] text-[hsl(var(--brand))] font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                              {i + 1}
                            </span>
                            <span className="text-base text-foreground font-sans leading-snug group-hover:text-[hsl(var(--brand))] transition-colors">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {entry.image && (
                    <img
                      src={entry.image}
                      alt={`${entry.version} visual`}
                      className="mt-8 w-full rounded-lg object-cover shadow-md border border-border bg-muted"
                      loading="lazy"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </main>
        </div>
      </section>
    </TooltipProvider>
  );
};

export { Changelog1 };

export const defaultChangelogData: ChangelogEntry[] = [
  {
    version: "Version 2.1.0",
    date: "10 June 2025",
    title: "AI-Powered Revision Planner",
    description:
      "Introducing a smart revision planner that adapts to your strengths and weaknesses for A Level and GCSE subjects.",
    items: [
      "Personalized study schedules",
      "AI-driven topic recommendations",
      "Progress tracking dashboard",
      "Syncs with your calendar",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 2.0.0",
    date: "25 May 2025",
    title: "Live Group Study Rooms",
    description:
      "Join or create live group study sessions with peers, complete with collaborative whiteboards and quizzes.",
    items: [
      "Real-time video and chat",
      "Collaborative whiteboard",
      "Instant group quizzes",
      "Session scheduling",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.9.0",
    date: "12 May 2025",
    title: "Exam-Style Mock Generator",
    description:
      "Generate unlimited exam-style mocks for any A Level or GCSE subject, instantly marked with feedback.",
    items: [
      "Customizable difficulty and topics",
      "Instant marking and feedback",
      "Downloadable PDF mocks",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.8.0",
    date: "28 April 2025",
    title: "Flashcard AI Assistant",
    description:
      "Create, import, and study flashcards with AI-generated hints and explanations.",
    items: [
      "AI-generated flashcard hints",
      "Spaced repetition scheduling",
      "Import from Quizlet or CSV",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.7.0",
    date: "15 April 2025",
    title: "Subject Mastery Insights",
    description:
      "Get detailed analytics on your mastery of each subject and topic, with actionable next steps.",
    items: [
      "Topic-by-topic mastery heatmap",
      "Suggested next topics",
      "Compare with national averages",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.6.0",
    date: "2 April 2025",
    title: "Mobile App Beta Release",
    description:
      "Try Semblancy on the go! Our mobile app beta is now available for iOS and Android.",
    items: [
      "Offline revision mode",
      "Push notifications for reminders",
      "Seamless sync with web",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.5.0",
    date: "18 March 2025",
    title: "Interactive Past Paper Library",
    description:
      "Access a searchable library of past papers with instant marking and worked solutions.",
    items: [
      "Filter by exam board and year",
      "Instant marking",
      "Step-by-step worked solutions",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.4.0",
    date: "5 March 2025",
    title: "Gamified Streaks & Achievements",
    description:
      "Stay motivated with daily streaks, badges, and leaderboards for revision milestones.",
    items: [
      "Daily and weekly streaks",
      "Achievement badges",
      "Global and friends leaderboards",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.3.0",
    date: "20 February 2025",
    title: "Teacher Dashboard Launch",
    description:
      "Teachers can now track class progress, assign tasks, and review student analytics.",
    items: [
      "Class progress overview",
      "Task assignment",
      "Student analytics export",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
  {
    version: "Version 1.2.0",
    date: "1 February 2025",
    title: "Launch of Semblancy Platform",
    description:
      "We're live! Start preparing for your A Level and GCSE exams with modern, AI-powered tools.",
    items: [
      "Smart revision planner",
      "Mock exam generator",
      "Flashcards and analytics",
    ],
    image: "https://shadcnblocks.com/images/block/placeholder-aspect-video-1.svg",
  },
];