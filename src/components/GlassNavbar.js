"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import styles from "./GlassNavbar.module.css";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAmplify } from "../app/context/Providers";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

const GlassNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAmplify();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Check if we're using dark theme
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDarkTheme(theme === "dark");
    };

    // Initial check
    checkTheme();

    // Set up a mutation observer to watch for attribute changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    // Add scroll lock when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Ensure we clean up the body style when component unmounts
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""} ${
        isMobileMenuOpen ? styles.mobileOpen : ""
      }`}
    >
      <div className={styles.navbarContainer}>
        <div className={styles.navbarLeft}>
          <Link href="/home" className={styles.logoLink}>
            <Logo size="large" showTitle={true} showTagline={true} invert={isDarkTheme} responsive={true} />
          </Link>
        </div>

        <div className={styles.navbarLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.active : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className={styles.navbarRight}>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard/overview"
                className={styles.dashboardButton}
              >
                Dashboard
              </Link>
              <LogoutButton className={styles.loginButton} />
            </>
          ) : (
            <>
              <ThemeToggle type="button" />
              <Link href="/login" className={styles.loginButton}>
                Log In
              </Link>
              <Link href="/signup" className={styles.signupButton}>
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`${styles.mobileMenu} ${
          isMobileMenuOpen ? styles.open : ""
        }`}
      >
        <div className={styles.mobileMenuLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`${styles.mobileNavLink} ${
                pathname === link.href ? styles.active : ""
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className={styles.mobileNavButtons}>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/overview"
                  className={styles.mobileLoginButton}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <LogoutButton className={styles.mobileSignupButton} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={styles.mobileLoginButton}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className={styles.mobileSignupButton}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlassNavbar;
