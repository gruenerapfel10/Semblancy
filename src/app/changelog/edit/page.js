"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostForm from "@/components/PostForm";
import ChangelogLayout from "@/components/ChangeLogLayout";
import { useAmplify } from "@/app/context/Providers";

// Create a client component that uses searchParams
function EditPost() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAmplify();
  const id = searchParams.get('id');
  
  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  return <PostForm postId={id} />;
}

// Main page component with Suspense boundary
export default function EditPostPage() {
  return (
    <ChangelogLayout>
      <Suspense fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <p>Loading post data...</p>
        </div>
      }>
        <EditPost />
      </Suspense>
    </ChangelogLayout>
  );
}