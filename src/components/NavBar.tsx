"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAmplify } from "../app/context/Providers";
import Logo from "../components/Logo";
import { extractFullName } from "@/utils";
import { ModeToggle } from "./mode-toggle";
import LogoutButton from "./LogoutButton";
import { SearchBar } from "./SearchTrigger";
import { AIAssistantIcon } from "./AIAssistantTrigger";

export default function Navbar() {
  const { isAuthenticated, checkAuthState } = useAmplify();
  const [authChecked, setAuthChecked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Force auth state check when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthState();
      setAuthChecked(true);
    };
    verifyAuth();
    window.addEventListener("authStateChange", verifyAuth);
    return () => {
      window.removeEventListener("authStateChange", verifyAuth);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const header = document.getElementById("navbar-header");
      const mobileMenu = document.getElementById("navbar-mobile-menu");
      if (
        isMobileMenuOpen &&
        header &&
        mobileMenu &&
        !header.contains(event.target as Node) &&
        !mobileMenu.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Optional: disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        id="navbar-header"
        className="flex items-center justify-between w-full h-16 px-6 bg-white shadow z-50 relative"
      >
        <div className="flex items-center gap-4">
          <Logo size="large" invert responsive={true} />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-lg">
            <SearchBar theme="dark" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AIAssistantIcon theme="dark" />
          {isAuthenticated && <LogoutButton className="hidden md:inline-flex px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"><span>Logout</span></LogoutButton>}
          <ModeToggle />
          {!isAuthenticated && authChecked && (
            <Link
              href="/login"
              className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}
        </div>
        {/* Hamburger Menu Button */}
        <button
          className={`md:hidden flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ml-4${isMobileMenuOpen ? " bg-gray-100" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-800 mb-1 transition-all duration-300${isMobileMenuOpen ? " rotate-45 translate-y-1.5" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 mb-1 transition-all duration-300${isMobileMenuOpen ? " opacity-0" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300${isMobileMenuOpen ? " -rotate-45 -translate-y-1.5" : ""}`}></span>
        </button>
      </header>
      {/* Mobile Menu */}
      <div
        id="navbar-mobile-menu"
        className={`fixed top-0 left-0 w-full h-full bg-white z-40 flex flex-col items-center pt-20 transition-transform duration-300 md:hidden${isMobileMenuOpen ? " translate-x-0" : " -translate-x-full"}`}
        style={{ minHeight: "100vh" }}
      >
        <div className="w-full max-w-lg px-4 mb-6">
          <SearchBar theme="dark" />
        </div>
        <Link
          href="/dashboard/overview"
          className="w-full text-center py-3 text-lg font-medium text-gray-800 hover:bg-gray-100 transition"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/how-it-works"
          className="w-full text-center py-3 text-lg font-medium text-gray-800 hover:bg-gray-100 transition"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          How It Works
        </Link>
        <div className="flex flex-col items-center gap-4 mt-8 w-full">
          <AIAssistantIcon theme="dark" />
          <ModeToggle />
          {isAuthenticated ? (
            <LogoutButton className="w-full px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"><span>Logout</span></LogoutButton>
          ) : (
            <Link
              href="/login"
              className="w-full px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
} 