"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Logo.module.css";

// Import SVG files as standard images
import ProsembleLogoV2 from "../assets/images/prosemble-logo-v2.svg";
import ProsembleLogoV2White from "../assets/images/prosemble-logo-v2-white.svg";
import ProsembleLogoV2Title from "../assets/images/prosemble-logo-v2-title.svg";
import ProsembleLogoV2TitleWhite from "../assets/images/prosemble-logo-v2-title-white.svg";
import ProsembleLogoV2Text from "../assets/images/prosemble-logo-v2-text.svg";
import ProsembleLogoV2TextWhite from "../assets/images/prosemble-logo-v2-text-white.svg";

const Logo = ({ 
  size = "medium", 
  invert = false, 
  showIcon = true, 
  showTitle = true, 
  showTagline = true 
}) => {
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

  // Get the configuration based on size
  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <div className={styles.logoContainer}>
      {showIcon && (
        <div className={styles.logoIcon}>
          <Image
            src={invert ? ProsembleLogoV2White : ProsembleLogoV2}
            alt="Prosemble Logo Icon"
            width={config.container.width}
            height={config.container.height}
            priority
          />
        </div>
      )}
      
      {(showTitle || showTagline) && (
        <div className={styles.logoTextContainer}>
          {showTitle && (
            <div className={styles.titleContainer}>
              <Image
                src={invert ? ProsembleLogoV2TitleWhite : ProsembleLogoV2Title}
                alt="Prosemble"
                width={config.text.width}
                height={config.text.height}
                className={styles.title}
                priority
              />
            </div>
          )}
          
          {showTagline && (
            <div className={styles.textContainer}>
              <Image
                src={invert ? ProsembleLogoV2TextWhite : ProsembleLogoV2Text}
                alt="Precision science"
                width={config.text.width / 1.5}
                height={config.text.height / 2.5}
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