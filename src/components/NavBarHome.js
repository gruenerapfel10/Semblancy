"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavBarHome.module.css";
import Logo from "./Logo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faLaptopCode, 
  faStream, 
  faNewspaper, 
  faEnvelope, 
  faHandshake, 
  faSignInAlt 
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.desktopLogo}>
            <Logo size="large" />
          </div>
          <div className={styles.mobileLogo}>
            <Logo size="medium" />
          </div>
        </Link>
        <div className={styles.navLinks}>
          <Link 
            href="/company" 
            className={`${styles.navLink} ${isActive('/company') ? styles.activeLink : ''}`}
          >
            Company
          </Link>
          <Link 
            href="/technology" 
            className={`${styles.navLink} ${isActive('/technology') ? styles.activeLink : ''}`}
          >
            Technology
          </Link>
          <Link 
            href="/pipeline" 
            className={`${styles.navLink} ${isActive('/pipeline') ? styles.activeLink : ''}`}
          >
            Pipeline
          </Link>
          <Link 
            href="/news" 
            className={`${styles.navLink} ${isActive('/news') ? styles.activeLink : ''}`}
          >
            News
          </Link>
          <Link 
            href="/contact" 
            className={`${styles.navLink} ${isActive('/contact') ? styles.activeLink : ''}`}
          >
            Contact
          </Link>
        </div>
        <div className={styles.navButtons}>
          <Link
            href="/contact"
            className={`btn btn-primary ${styles.btnTouchSm}`}
          >
            <button className={styles.getInTouchButton}>GET IN TOUCH</button>
          </Link>
          <Link
            href="/login"
            className={`btn btn-secondary ${styles.btnLogin}`}
          >
            <button className={styles.prosembleLoginButton}>
              PROSEMBLE LOGIN
            </button>
          </Link>
        </div>
        {/* Hamburger icon for mobile */}
        <button className={styles.hamburger} onClick={toggleMobileMenu}>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>
      </div>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <Link
            href="/company"
            className={`${styles.mobileNavLink} ${isActive('/company') ? styles.activeMobileLink : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faBuilding} className={styles.navIcon} />{" "}
            Company
          </Link>
          <Link
            href="/technology"
            className={`${styles.mobileNavLink} ${isActive('/technology') ? styles.activeMobileLink : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faLaptopCode} className={styles.navIcon} />{" "}
            Technology
          </Link>
          <Link
            href="/pipeline"
            className={`${styles.mobileNavLink} ${isActive('/pipeline') ? styles.activeMobileLink : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faStream} className={styles.navIcon} />{" "}
            Pipeline
          </Link>
          <Link
            href="/news"
            className={`${styles.mobileNavLink} ${isActive('/news') ? styles.activeMobileLink : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faNewspaper} className={styles.navIcon} />{" "}
            News
          </Link>
          <Link
            href="/contact"
            className={`${styles.mobileNavLink} ${isActive('/contact') ? styles.activeMobileLink : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faEnvelope} className={styles.navIcon} />{" "}
            Contact
          </Link>
          <div className={styles.mobileDiv}></div>
          <Link
            href="/contact"
            className={`btn btn-primary ${styles.btnTouchSm}`}
          >
            <button className={styles.getInTouchButtonMobile}>
              GET IN TOUCH
            </button>
          </Link>
          <Link href="/login">
            <button className={styles.prosembleLoginButtonMobile}>
              PROSEMBLE LOGIN
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}