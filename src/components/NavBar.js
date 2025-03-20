"use client";
import Link from "next/link";
import { useAmplify } from "../app/Providers";
import Logo from "../components/Logo";
import styles from "./NavBar.module.css";
import { extractFullName } from "@/utils";
import ThemeToggle from "../components/ThemeToggle.js"

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAmplify();

  return (
    <header className={styles.header}>
      <Logo size="large" invert="true" />
      <div className={styles.headerActions}>
        {isAuthenticated && (
          <>
            <button onClick={signOut} className={styles.logoutButton}>
              Logout
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </>
        )}
        <ThemeToggle type="button" />
        {!isAuthenticated && (
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
