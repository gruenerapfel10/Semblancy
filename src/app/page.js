"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAmplify } from "./context/Providers";
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
        router.push("/dashboard/overview");
      } else {
        router.push("/home");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className={styles.loadingContainer}>
      <Logo size="large" responsive={true} />
      <LoadingSpinner />
      <p>Loading Semblancy...</p>
    </div>
  );
}
