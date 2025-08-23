import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DualPanelProps {
  className?: string
}

export function DualPanelSection({ className }: DualPanelProps) {
  return (
    <section className={cn("w-full py-12 md:py-24", className)}>
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel - AI Safety */}
          <div className="relative overflow-hidden rounded-3xl bg-background border border-border p-8 md:p-12 flex flex-col justify-center">
            <div className="relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">AI safety at Semblancy</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Semblancy is the leader in responsible use of AI for education through Moderation, Accountability and
                Provenance.
              </p>
              <Button asChild className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                <Link href="/safety">LEARN MORE</Link>
              </Button>
            </div>
            <DotPattern className="absolute bottom-0 right-0 text-muted/20" />
          </div>

          {/* Right Panel - Research */}
          <div className="relative overflow-hidden rounded-3xl bg-black p-8 md:p-12 text-white flex flex-col justify-center dark:bg-white dark:text-black">
            <div className="relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">Educational Research</h2>
              <p className="text-white/70 mb-8 max-w-md dark:text-black/70">
                Semblancy pioneers research in AI-powered education, creating personalized learning experiences that
                adapt to each student&apos;s needs.
              </p>
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-transparent text-white border-white hover:bg-white/10 dark:text-black dark:border-black dark:hover:bg-black/10"
              >
                <Link href="/about-us">ABOUT US</Link>
              </Button>
            </div>
            <CirclePattern className="absolute bottom-0 right-0 text-white/10 dark:text-black/10" />
          </div>
        </div>
      </div>
    </section>
  )
}

function DotPattern({ className }: { className?: string }) {
  return (
    <svg
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[80%] w-[80%]", className)}
    >
      <g opacity="0.5">
        {Array.from({ length: 20 }).map((_, rowIndex) =>
          Array.from({ length: 20 }).map((_, colIndex) => (
            <circle
              key={`${rowIndex}-${colIndex}`}
              cx={10 + colIndex * 30}
              cy={10 + rowIndex * 30}
              r={2 + Math.random() * 2}
              fill="currentColor"
              opacity={0.3 + Math.random() * 0.7}
            />
          )),
        )}
      </g>
    </svg>
  )
}

function CirclePattern({ className }: { className?: string }) {
  return (
    <svg
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[80%] w-[80%]", className)}
    >
      <g opacity="0.2">
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx="300" cy="300" r={50 + i * 40} stroke="currentColor" strokeWidth="1" fill="none" />
        ))}
      </g>
    </svg>
  )
}
