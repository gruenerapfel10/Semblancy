"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAmplify } from "../app/context/Providers";
import Logo from "./Logo";
import styles from "./NavBar.module.css";
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

    // Set up an event listener for auth state changes
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
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest(`.${styles.header}`) && !event.target.closest(`.${styles.mobileMenu}`)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Optional: disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={styles.header}>
        <Logo size="large" invert="true" responsive={true} />
        
        <div className={styles.omniSearchContainer}>
          <SearchBar theme="dark"/>
        </div>
        
        <div className={styles.headerActions}>
          <AIAssistantIcon theme="dark" />
          {isAuthenticated && <LogoutButton className={styles.logoutButton} />}
          <ModeToggle />
          {!isAuthenticated && authChecked && (
            <Link href="/login" className={styles.loginButton}>
              Login
            </Link>
          )}
        </div>
        
        {/* Hamburger Menu Button */}
        <button 
          className={`${styles.hamburgerButton} ${isMobileMenuOpen ? styles.open : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </button>
      </header>
      
      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        <div className={styles.mobileSearchContainer}>
          <SearchBar theme="dark" />
        </div>
        
        <Link href="/dashboard/overview" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
          Dashboard
        </Link>
        
        <Link href="/dashboard/how-it-works" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
          How It Works
        </Link>
        
        <div className={styles.mobileActions}>
          <AIAssistantIcon theme="dark" />
          <ModeToggle />
          {isAuthenticated ? (
            <LogoutButton className={styles.mobileLogoutButton} />
          ) : (
            <Link href="/login" className={styles.mobileLoginButton} onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
