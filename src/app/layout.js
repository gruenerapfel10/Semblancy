"use client";
// File: src/app/layout.js
import "./globals.css";
import { AmplifyProvider } from "./context/Providers";
import Navbar from "../components/NavBar";
import { usePathname } from "next/navigation";
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
import { useEffect } from "react";
import { preloadSounds } from "@/utils/soundManager";

const noNavbarPaths = ["/login", "/signup", "/register", "/reset-password", "/home", "/company", "/pipeline", "/technology", "/news", "/contact", "/forgot-password", "/changelog", "/signupFuture", "/loginFuture", "/"];
const noFooterPaths = ["/dashboard", "/"];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current pathname starts with any of the paths in the exclusion lists
  const shouldHideNavbar = noNavbarPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const shouldHideFooter = noFooterPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  // Preload sounds when the app starts
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
                  {!shouldHideNavbar && <Navbar />}
                  {children}
                  {!shouldHideFooter && <Footer />}
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