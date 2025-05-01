import { Menu } from "lucide-react";
import { SidebarTrigger as BaseSidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function SidebarTrigger() {
  return (
    <BaseSidebarTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </BaseSidebarTrigger>
  );
} 