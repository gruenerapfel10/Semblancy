"use client";
// File: src/app/layout.js
import "./globals.css";
import { AmplifyProvider } from "./context/Providers";
import Navbar from "../components/NavBar";
import { usePathname } from "next/navigation";
import './variables.css'
import Footer from "@/components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider } from "./context/DataContext";
import { SearchProvider } from "./context/SearchContext";
import SearchModal from "@/components/SearchModal";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "@/components/ToastContainer";

const noNavbarPaths = ["/login", "/signup", "/register", "/reset-password", "/home", "/company", "/pipeline", "/technology", "/news", "/contact", "/forgot-password", "/changelog", "/signupFuture", "/loginFuture", "/"];
const noFooterPaths = ["/dashboard", "/"];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current pathname starts with any of the paths in the exclusion lists
  const shouldHideNavbar = noNavbarPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const shouldHideFooter = noFooterPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <html lang="en">
      <body>
        <AmplifyProvider>
          <ThemeProvider>
            <ToastProvider>
              <SearchProvider>
                {!shouldHideNavbar && <Navbar />}
                {children}
                {!shouldHideFooter && <Footer />}
                <SearchModal />
                <ToastContainer />
              </SearchProvider>
            </ToastProvider>
          </ThemeProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}