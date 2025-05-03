"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Logo.module.css";

// Import SVG files as standard images
import GCSESimulatorLogoV1 from "../assets/images/gcsesimulatorlogo.svg";
import GCSESimulatorLogoV1White from "../assets/images/gcsesimulatorlogowhite.svg";
import GCSESimulatorLogoV1Title from "../assets/images/gcsesimulatortitle.svg";
import GCSESimulatorLogoV1TitleWhite from "../assets/images/gcsesimulatortitlewhite.svg";
import GCSESimulatorLogoV1Text from "../assets/images/gcsesimulatortext.svg";
import GCSESimulatorLogoV1TextWhite from "../assets/images/gcsesimulatortextwhite.svg";

import SemblanceLogoV1 from "../assets/images/SEMBLANCE-logo.svg";
import SemblanceLogoV1White from "../assets/images/SEMBLANCE-logo-white.svg";

const Logo = ({ 
  size = "medium", 
  invert = false, 
  showIcon = true, 
  showTitle = true, 
  showTagline = true,
  responsive = false 
}) => {
  // State to hold the current size based on screen width
  const [currentSize, setCurrentSize] = useState(size);

  // Handle responsiveness if the responsive prop is true
  useEffect(() => {
    if (!responsive) return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setCurrentSize("small");
      } else if (width <= 768) {
        setCurrentSize("medium");
      } else if (width <= 1024) {
        setCurrentSize("large");
      } else {
        setCurrentSize(size); // Default to the provided size for larger screens
      }
    };

    // Set initial size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [responsive, size]);

  // Size configurations
  const sizeConfig = {
    small: {
      container: { height: 30, width: 30 },
      text: { height: 15, width: 93 },
      tagline: { fontSize: "8px" },
    },
    medium: {
      container: { height: 60, width: 60 },
      text: { height: 30, width: 160 },
      tagline: { fontSize: "40px" },
    },
    large: {
      container: { height: 80, width: 80 },
      text: { height: 50, width: 240 },
      tagline: { fontSize: "24px" },
    },
    xl: {
      container: { height: 90, width: 90 },
      text: { height: 50, width: 300 },
      tagline: { fontSize: "32px" },
    },
    mobile: {
      container: { height: 50, width: 50 },
      text: { height: 40, width: 160 },
      tagline: { fontSize: "20px" },
    },
    auto: {
      container: { height: "auto", width: "auto" },
      text: { height: "auto", width: "auto" },
      tagline: { fontSize: "20px" },
    },
  };

  // Get the configuration based on the current size (which might be dynamically set)
  const config = sizeConfig[currentSize] || sizeConfig.medium;

  return (
    <div className={`${styles.logoContainer} ${responsive ? styles.responsive : ''}`}>
      {showIcon && (
        <div className={styles.logoIcon}>
          <Image
            src={GCSESimulatorLogoV1}
            alt="Semblance Logo Icon"
            width="100%"
            height={config.container.height/ 1.3}
            priority
          />
        </div>
      )}
      
      {(showTitle || showTagline) && (
        <div className={styles.logoTextContainer}>
          {showTitle && (
            <div className={styles.titleContainer}>
              <Image
                src={invert ? SemblanceLogoV1White : SemblanceLogoV1}
                alt="SEMBLANCE"
                className={styles.title}
                height={config.text.height / 2}
                priority
              />
            </div>
          )}
          
        </div>
      )}
    </div>
  );
};

export default Logo;