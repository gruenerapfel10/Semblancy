import { MacOSWindow } from "@/components/ui/mac-os-window";

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export function VideoPlayer({
  src,
  className = "",
  autoPlay = true,
  loop = true,
  muted = true,
}: VideoPlayerProps) {
  return (
    <div className={`relative w-full overflow-hidden aspect-[4/3] ${className}`}>
      {/* Vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]" />
      
      <video
        className="w-full h-full object-cover absolute inset-0"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
} 