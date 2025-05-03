"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import ChangelogLayout from "@/components/ChangeLogLayout";

// Inner component that uses searchParams
function PostDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  return <PostDetail postId={id} />;
}

// Main page component with Suspense boundary
export default function PostDetailPage() {
  return (
    <ChangelogLayout>
      <Suspense fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <p>Loading post...</p>
        </div>
      }>
        <PostDetailContent />
      </Suspense>
    </ChangelogLayout>
  );
}