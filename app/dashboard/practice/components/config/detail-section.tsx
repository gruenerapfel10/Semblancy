import { LucideIcon } from "lucide-react";

interface DetailSectionProps {
  icon: LucideIcon;
  title: string;
  items: string[];
}

export function DetailSection({ icon: Icon, title, items }: DetailSectionProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
        <h4 className="font-medium text-xs">{title}</h4>
      </div>
      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-xs ml-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
} 