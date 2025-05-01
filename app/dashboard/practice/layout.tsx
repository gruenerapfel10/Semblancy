"use client";

import { useMediaQuery } from "@/app/hooks/use-media-query";
import { useEffect, useState } from "react";

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after the first render
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full p-4 md:p-6 lg:p-8">
        <div className="h-full animate-pulse bg-muted/50 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="h-full p-2 md:p-3 lg:p-4">
      {children}
    </div>
  );
} 