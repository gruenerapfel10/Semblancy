"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAmplify } from './Providers'
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAmplify();

  useEffect(() => {
    // Only redirect after authentication check completes
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading Prosemble...</p>
    </div>
  );
}