import { Changelog1 } from "@/components/ui/changelog";
import { changelogData } from "@/lib/changelog-data";

export default function ChangelogPage() {
  return (
      <Changelog1 
        title="Product Updates"
        description="Stay up to date with the latest features, improvements, and fixes."
        entries={changelogData}
      />
  );
}
