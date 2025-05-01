"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { useAmplify } from "../context/Providers";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/NavBar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading } = useAmplify();
  const pathname = usePathname();

  if (isLoading) {
    return <LoadingSpinner fullPage={true} text="Loading your dashboard..." />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
        <Navbar />
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard/overview">
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block">
                      {/* The separator already renders a chevron by default */}
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {pathname.split("/").slice(-1)[0].replace(/-/g, " ") || "Overview"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </div>
    </SidebarProvider>
  );
} 