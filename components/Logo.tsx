"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

// Import your SVG files
// Note: You'll need to add these SVG files to your project
import GCSESimulatorLogoV1 from "@/public/images/gcsesimulatorlogo.svg";
import GCSESimulatorLogoV1White from "@/public/images/gcsesimulatorlogowhite.svg";
import SemblanceLogoV1 from "@/public/images/SEMBLANCE-logo.svg";
import SemblanceLogoV1White from "@/public/images/SEMBLANCE-logo-white.svg";

interface SizeConfig {
  container: { height: number | string; width: number | string };
  text: { height: number | string; width: number | string };
  tagline: { fontSize: string };
}

interface LogoProps {
  size?: "small" | "medium" | "large" | "xl" | "mobile" | "auto";
  invert?: boolean;
  showIcon?: boolean;
  showTitle?: boolean;
  showTagline?: boolean;
  responsive?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = "medium", 
  invert = false, 
  showIcon = true, 
  showTitle = true, 
  showTagline = true,
  responsive = false 
}) => {
  const [currentSize, setCurrentSize] = useState<LogoProps["size"]>(size);
  const [currentInvert, setCurrentInvert] = useState(false);

  useEffect(() => {
    setCurrentInvert(invert);
  }, [invert]);

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
        setCurrentSize(size);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [responsive, size]);

  const sizeConfig: Record<NonNullable<LogoProps["size"]>, SizeConfig> = {
    small: {
      container: { height: 30, width: 30 },
      text: { height: 15, width: 93 },
      tagline: { fontSize: "8px" },
    },
    medium: {
      container: { height: 40, width: 40 },
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

  const config = sizeConfig[currentSize || "medium"];

  return (
    <div className={`flex items-center gap-2 ${responsive ? 'responsive' : ''}`}>
      {showIcon && (
        <div className="logo-icon">
          <Image
            src={GCSESimulatorLogoV1}
            alt="Semblance Logo Icon"
            width={config.container.width as number}
            height={config.container.height as number}
            priority
          />
        </div>
      )}
      
      {(showTitle || showTagline) && (
        <div className="flex flex-col">
          {showTitle && (
            <div>
              <Image
                src={currentInvert ? SemblanceLogoV1White : SemblanceLogoV1}
                alt="SEMBLANCE"
                width={config.text.width as number}
                height={config.text.height as number}
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