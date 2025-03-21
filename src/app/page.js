"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAmplify } from "./Providers";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";
import Logo from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAmplify();

  useEffect(() => {
    // Only redirect after authentication check completes
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/home");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className={styles.loadingContainer}>
      <Logo size="large" />
      <LoadingSpinner />
      <p>Loading Semblance...</p>
    </div>
  );
}
