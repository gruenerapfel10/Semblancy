"use client";

import { useState, Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AIPanel } from "@/components/ai-panel";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { PageIndicator } from "@/components/page-indicator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="relative z-30">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col w-full">
          <main className="flex-1 min-h-0 overflow-y-auto relative bg-blue">
              {children}
          </main>
        </div>
        <AIPanel open={isAIPanelOpen} onOpenChange={setIsAIPanelOpen} />
      </div>
    </SidebarProvider>
  );
} 