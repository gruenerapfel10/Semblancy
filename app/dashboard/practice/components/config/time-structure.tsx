import { Separator } from "@/components/ui/separator";

interface TimeStructureProps {
  parts: { name: string; duration: number }[];
  totalDuration: number;
}

export function TimeStructure({ parts, totalDuration }: TimeStructureProps) {
  return (
    <div className="space-y-1">
      {parts.map((part, index) => (
        <div key={index} className="flex justify-between items-center text-xs">
          <span>{part.name}</span>
          <span className="font-medium">{part.duration} min</span>
        </div>
      ))}
      <Separator className="my-1" />
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium">Total Time</span>
        <span className="font-medium">{totalDuration} min</span>
      </div>
    </div>
  );
} 