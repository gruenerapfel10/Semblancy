"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./not-found.module.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Oops! The page you're looking for seems to have vanished into the
          digital void.
        </p>

        <div className={styles.decorativeElement}>
          <div className={styles.circle}></div>
          <div className={styles.line}></div>
          <div className={styles.circle}></div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => router.back()}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            Go Back
          </button>
          <Link
            href="/dashboard"
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      <div className={styles.illustration}>
        <div className={styles.notFoundGraphic}>
          <div className={styles.searchIcon}></div>
          <div className={styles.documentIcon}></div>
          <div className={styles.questionMark}>?</div>
        </div>
      </div>
    </div>
  );
}
