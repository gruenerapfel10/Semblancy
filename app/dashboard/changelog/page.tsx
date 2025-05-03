import { Changelog1, defaultChangelogData } from "@/components/ui/changelog";

export default function ChangelogPage() {
  return (
      <Changelog1 
        title="Product Updates"
        description="Stay up to date with the latest features, improvements, and fixes."
        entries={defaultChangelogData}
      />
  );
}
