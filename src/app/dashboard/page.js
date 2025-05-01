"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from "@/components/LoadingSpinner"; // Assuming you have this component

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Safe to access localStorage here as this only runs in the browser
    try {
      const firstTime = localStorage.getItem("prosemble-first-time");
      
      if (!firstTime) {
        // For first-time users, you might want to uncomment this
        // localStorage.setItem("prosemble-first-time", JSON.stringify("true"));
        // router.push('/dashboard/how-it-works');
        
        // Currently just redirecting to overview
        router.push('/dashboard/overview');
      } else {
        router.push('/dashboard/overview');
      }
    } catch (error) {
      // Fallback in case of localStorage errors
      console.error("Error accessing localStorage:", error);
      router.push('/dashboard/overview');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Show a loading state while redirecting
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">Redirecting to dashboard...</p>
      </div>
    );
  }
  
  // This return will rarely be seen as we redirect in the useEffect
  return null;
}