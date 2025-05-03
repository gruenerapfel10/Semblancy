import { Suspense } from "react";
import ChangelogLayout from "@/components/ChangeLogLayout";
import ChangelogFeed from "@/components/ChangeLogFeed";

export const metadata = {
  title: "Changelog & Issues | Prosemble",
  description: "View updates, improvements, and reported issues for the Prosemble platform.",
};

export default function ChangelogPage() {
  return (
    <ChangelogLayout>
      <Suspense fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <p>Loading changelog...</p>
        </div>
      }>
        <ChangelogFeed />
      </Suspense>
    </ChangelogLayout>
  );
}