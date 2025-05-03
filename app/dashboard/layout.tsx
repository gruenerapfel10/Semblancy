"use client";

import { useState, Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AIPanel } from "@/components/ai-panel";
import { Navbar } from "@/components/navbar";
import { DebugControls } from "./flashcards/components/DebugControls";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
          <Navbar />
        <div className="flex flex-1 w-full min-h-0 overflow-hidden bg-sidebar">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto relative bg-background p-4 rounded-tl-2xl border-l border-t">
              {children}
          </main>
          <AIPanel open={isAIPanelOpen} onOpenChange={setIsAIPanelOpen} />
        </div>
        <DebugControls />
      </div>
    </SidebarProvider>
  );
} 