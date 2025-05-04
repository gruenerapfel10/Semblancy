import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Logo from "@/components/Logo";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { Brain, Search } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandSearch } from "@/components/command-search";
import { cn } from "@/lib/utils";

interface NavbarProps {
  isAIPanelOpen?: boolean;
  onAIPanelOpenChange?: (open: boolean) => void;
}

export function Navbar({ isAIPanelOpen = false, onAIPanelOpenChange }: NavbarProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toggle AI panel with Cmd+J or Ctrl+J shortcut
  useHotkeys(['meta+j', 'ctrl+j'], (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAIPanelOpenChange?.(!isAIPanelOpen);
  }, { enableOnFormTags: true });

  // Toggle search with Cmd+K or Ctrl+K shortcut
  useHotkeys(['meta+k', 'ctrl+k'], (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsSearchOpen(prev => !prev);
  }, { enableOnFormTags: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;
  const modifierKey = isMac ? '⌘' : 'Ctrl';
  
  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-sidebar">
        <div className="flex h-14 items-center w-full px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Button variant="ghost" className="hover:bg-transparent" asChild>
              <Logo size="medium" showTagline={false} invert={mounted && theme === 'dark'} />
            </Button>
          </div>
          <nav className="ml-auto flex items-center gap-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              title="Search (⌘K)"
              className={cn(
                "relative gap-1 h-8 text-xs text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 ml-auto">
                <span className="text-xs">{modifierKey}</span>K
              </kbd>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onAIPanelOpenChange?.(!isAIPanelOpen)}
              title="Language Assistant (⌘J)"
              className="relative"
              aria-pressed={isAIPanelOpen}
            >
              <Brain className="h-5 w-5" />
              <span className="sr-only">AI Assistant</span>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <CommandSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
} 