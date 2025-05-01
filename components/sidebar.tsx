import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Home, Inbox, Calendar, Search, Settings, Book, User2, Star, History, Layers, FileText, Users, Folder, Menu, LogOut } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <ShadcnSidebar collapsible="icon">
      {/* Header with workspace/account dropdown and collapse button */}
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {/* Collapse/Expand button, only visible on md+ screens */}
          <SidebarTrigger className="md:inline-flex hidden" />
          <div className="flex-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <div className="flex items-center gap-2">
                        <div className="bg-black rounded-lg w-9 h-9 flex items-center justify-center text-white font-bold text-xl">A</div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium leading-tight">Acme Inc</span>
                          <span className="text-xs text-muted-foreground">Enterprise</span>
                        </div>
                        <ChevronDown className="ml-auto" />
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>Acme Inc</DropdownMenuItem>
                    <DropdownMenuItem>Acme Corp.</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Platform group with collapsible Playground */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Layers className="mr-2" />
                      <span>Playground</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild size="sm">
                          <Link href="#">
                            <History className="mr-2" />
                            <span>History</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild size="sm">
                          <Link href="#">
                            <Star className="mr-2" />
                            <span>Starred</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild size="sm">
                          <Link href="#">
                            <Settings className="mr-2" />
                            <span>Settings</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <Folder className="mr-2" />
                    <span>Models</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <Book className="mr-2" />
                    <span>Documentation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <Settings className="mr-2" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user dropdown */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://github.com/shadcn.png"
                      alt="shadcn"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-medium leading-tight">shadcn</span>
                      <span className="text-xs text-muted-foreground">m@example.com</span>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
} 