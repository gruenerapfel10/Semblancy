declare module '@/components/ui/sidebar' {
  export interface SidebarProviderProps {
    children: React.ReactNode;
    defaultOpen?: boolean;
  }
  
  export const SidebarProvider: React.FC<SidebarProviderProps>;
} 