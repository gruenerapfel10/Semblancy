"use client";
// File: app/components/HeroSection.js
import Link from "next/link";
import styles from "./HeroSection.module.css";
import femalescientist from "../assets/images/femalescientist.png";
import mobilehero from "../assets/images/mobilehero.jpg";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to update state based on window width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className={styles.heroSection}>
      <div className={styles.backgroundContainer}>
        <Image
          src={isMobile ? mobilehero : femalescientist}
          alt="Hero image"
          className={styles.backgroundImage}
          priority
        />
        <div className={styles.darkTint}></div>
        <div className={styles.gradientOverlay}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Revolutionising Cancer Treatment with AI & Nanotechnology
          </h1>

          <p className={styles.description}>
            At Prosemble, we're transforming cancer care with cutting-edge nanoparticle and AI technologies enhancing treatment efficacy while minimising side effects.
          </p>

          <div className={styles.spacing}>
            test
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <h2 className={styles.statNumber}>
                30M<span>+</span>
              </h2>
              <p className={styles.statText}>
                CANCER CASES
                <br />
                PER YEAR BY 2040
              </p>
            </div>

            <div className={styles.statItem}>
              <h2 className={styles.statNumber}>
                18M<span>+</span>
              </h2>
              <p className={styles.statText}>
                WILL UNDERGO
                <br />
                CHEMOTHERAPY
              </p>
            </div>

            <div className={styles.statItem}>
              <h2 className={styles.statNumber}>
                800B<span>$</span>
              </h2>
              <p className={styles.statText}>
                VALUATION OF
                <br />
                ONCOLOGY MARKET
              </p>
            </div>
          </div>

          <div className={styles.buttons}>
            <button
              className={styles.learnMoreButton}
              onClick={(e) => {
                e.preventDefault();
                const advancementsSection = document.querySelector(
                  "section:nth-of-type(2)"
                );
                if (advancementsSection) {
                  advancementsSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              LEARN MORE
              <svg
                className={styles.chevronDown}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <Link href="/login" className="btn btn-secondary">
              <button className={styles.prosembleLoginButton}>
                PROSEMBLE LOGIN
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
