"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostForm from "@/components/PostForm";
import ChangelogLayout from "@/components/ChangeLogLayout";
import { useAmplify } from "@/app/Providers";

export default function NewPostPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAmplify();
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);

      if (!isAuthenticated) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !authChecked) {
    return (
      <ChangelogLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            minHeight: "400px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid rgba(5, 165, 225, 0.1)",
                borderTopColor: "var(--kredirel-medium-blue)",
                borderRadius: "50%",
                margin: "0 auto 1rem auto",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p>Verifying authentication...</p>
          </div>
        </div>
      </ChangelogLayout>
    );
  }

  return (
    <ChangelogLayout>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
        <h1
          style={{
            fontSize: "var(--font-xl)",
            fontWeight: "700",
            marginBottom: "1.5rem",
            textAlign: "center",
            color: "var(--kredirel-dark-blue)",
          }}
        >
          Create New Post
        </h1>
        <PostForm />
      </div>
    </ChangelogLayout>
  );
}
