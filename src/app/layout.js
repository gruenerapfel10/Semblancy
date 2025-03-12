"use client";
// File: src/app/layout.js
import "./globals.css";
import { AmplifyProvider, useAmplify } from "./Providers.jsx";
import Navbar from "../components/NavBar";
import { usePathname } from "next/navigation";
import './variables.css'
import Footer from "@/components/Footer";
import { useState, useEffect } from 'react';

const noNavbarPaths = ["/login", "/signup", "/register", "/reset-password", "/home", "/company", "/pipeline", "/technology", "/news", "/contact", "/forgot-password", "/changelog", "/signupFuture", "/loginFuture"];
const noFooterPaths = ["/dashboard"];

// Wrapper component to handle theme after authentication is checked
function ThemeHandler({ children }) {
  const { isAuthenticated, isLoading, getUserPreferences } = useAmplify();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try to get user preferences if authenticated
        if (isAuthenticated) {
          const preferences = await getUserPreferences();
          if (preferences && preferences.theme) {
            setTheme(preferences.theme);
            document.documentElement.setAttribute('data-theme', preferences.theme);
            // Also update localStorage for consistency
            localStorage.setItem('theme', preferences.theme);
            return;
          }
        }
        
        // Fallback to localStorage if no authenticated preferences
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
          // If no saved preference, check for system preference
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };

    if (!isLoading) {
      loadTheme();
    }

    // Set up a listener for theme changes from other components
    const handleThemeChange = (e) => {
      if (e.detail?.theme) {
        setTheme(e.detail.theme);
        document.documentElement.setAttribute('data-theme', e.detail.theme);
        // Save to localStorage as a fallback
        localStorage.setItem('theme', e.detail.theme);
      }
    };

    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, [isAuthenticated, isLoading, getUserPreferences]);

  return children;
}

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current pathname starts with any of the paths in the exclusion lists
  const shouldHideNavbar = noNavbarPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const shouldHideFooter = noFooterPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <html lang="en">
      <body>
        <AmplifyProvider>
          <ThemeHandler>
            {!shouldHideNavbar && <Navbar />}
            {children}
            {!shouldHideFooter && <Footer />}
          </ThemeHandler>
        </AmplifyProvider>
      </body>
    </html>
  );
}