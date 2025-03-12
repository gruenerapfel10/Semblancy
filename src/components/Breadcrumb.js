// components/Breadcrumb/Breadcrumb.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumb.module.css";

export default function Breadcrumb({ title, customTrail }) {
  const pathname = usePathname();

  // Generate breadcrumb trail based on path if not provided
  const generateTrail = () => {
    if (customTrail) return customTrail;

    const paths = pathname.split("/").filter((path) => path);

    // Default trail always starts with Home
    const trail = [{ label: "Home", path: "/", active: false }];

    // Add path segments to the trail
    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;

      // Format the label (capitalize first letter, replace hyphens with spaces)
      const label = path
        .split("-")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

      trail.push({
        label,
        path: currentPath,
        active: isLast,
      });
    });

    return trail;
  };

  const trail = generateTrail();

  return (
    <div className={styles.breadcrumbSection}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          {title || trail[trail.length - 1]?.label || "Page"}
        </h1>
        <div className={styles.breadcrumb}>
          {trail.map((item, index) => (
            <span key={index}>
              {index > 0 && <span className={styles.separator}>&gt;</span>}
              {item.active ? (
                <span className={styles.breadcrumbInactive}>{item.label}</span>
              ) : (
                <Link href={item.path}>{item.label}</Link>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
