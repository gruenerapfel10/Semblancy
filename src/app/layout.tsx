"use client";
import "./globals.css";
import { AmplifyProvider } from "./context/Providers";
import Navbar from "../components/NavBar";
import './variables.css'
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { DataProvider } from "./context/DataContext";
import { SearchProvider } from "./context/SearchContext";
import { AIAssistantProvider } from "./context/AIAssistantContext";
import SearchModal from "@/components/SearchModal";
import AIAssistant from "@/components/AIAssistant";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "@/components/ToastContainer";
import { useEffect, ReactNode } from "react";
import { preloadSounds } from "@/utils/soundManager";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    preloadSounds();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AmplifyProvider>
            <ToastProvider>
              <SearchProvider>
                <AIAssistantProvider>
                  {children}
                  <SearchModal />
                  <AIAssistant />
                  <ToastContainer />
                </AIAssistantProvider>
              </SearchProvider>
            </ToastProvider>
          </AmplifyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 