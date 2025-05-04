import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Logo from "@/components/Logo";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/sidebar-trigger";

export function Navbar() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-sidebar">
      <div className="flex h-14 items-center w-full px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Button variant="ghost" className="hover:bg-transparent" asChild>
            <Logo size="medium" showTagline={false} invert={mounted && theme === 'dark'} />
          </Button>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
} 