"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ChangeLogLayout.module.css";

export default function ChangelogLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href="/dashboard" className={styles.logoLink}>
            <div className={styles.logo}>Prosemble</div>
          </Link>

          <div className={styles.navLinks}>
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link
              href="/changelog"
              className={`${styles.navLink} ${styles.active}`}
            >
              Changelog
            </Link>
          </div>

          <div className={styles.mobileMenu}>
            <button
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div
                className={`${styles.menuIcon} ${
                  isMenuOpen ? styles.open : ""
                }`}
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className={styles.mobileNav}>
            <Link
              href="/dashboard"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/changelog"
              className={`${styles.mobileNavLink} ${styles.active}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Changelog
            </Link>
          </div>
        )}
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
