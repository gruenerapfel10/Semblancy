import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Home, Settings, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/sidebar-trigger";
import { UpdateNotification } from "@/components/ui/UpdateNotification";
import { changelogData } from "@/lib/changelog-data";

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
          <UpdateNotification 
            entries={changelogData}
            showButton={true}
            autoShowLatest={false}
          />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <User className="w-5 h-5 text-slate-600" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <Home className="w-4 h-4 text-indigo-600" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-600" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
} 