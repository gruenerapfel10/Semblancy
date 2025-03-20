"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAmplify } from "../app/Providers";
import Logo from "../components/Logo";
import styles from "./NavBar.module.css";
import { extractFullName } from "@/utils";
import ThemeToggle from "../components/ThemeToggle.js";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { isAuthenticated, checkAuthState } = useAmplify();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Force auth state check when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthState();
      setAuthChecked(true);
    };
    
    verifyAuth();
    
    // Set up an event listener for auth state changes
    window.addEventListener('authStateChange', verifyAuth);
    
    return () => {
      window.removeEventListener('authStateChange', verifyAuth);
    };
  }, []);
  
  return (
    <header className={styles.header}>
      <Logo size="large" invert="true" />
      <div className={styles.headerActions}>
        {isAuthenticated && (
          <LogoutButton className={styles.logoutButton} />
        )}
        <ThemeToggle type="button" />
        {!isAuthenticated && authChecked && (
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}