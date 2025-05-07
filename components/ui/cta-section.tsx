import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  title?: string;
  headline?: string;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
}

export function CTASection({
  title = "CTA section",
  headline = "Action-driving headline that creates urgency",
  buttonText = "Get started",
  buttonHref = "/signup",
  className = "",
}: CTASectionProps) {
  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="relative mx-auto max-w-4xl">
          {/* Gradient blur effects */}
          <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-3xl opacity-20 -z-10" />
          <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 blur-3xl opacity-20 -z-10 animate-pulse" />
          
          {/* Main CTA Card */}
          <div className="relative overflow-hidden rounded-3xl bg-black/95 shadow-2xl ring-1 ring-gray-900/10 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/95 to-black/90" />
            
            <div className="relative px-8 py-16 text-center sm:px-16">
              {title && (
                <p className="text-sm uppercase tracking-wider mb-3 text-gray-400">
                  {title}
                </p>
              )}
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-2xl mx-auto mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-200">
                {headline}
              </h2>
              
              <Button 
                asChild 
                size="lg" 
                className="rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)]"
              >
                <Link href={buttonHref} className="flex items-center gap-2">
                  {buttonText}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="ml-1 transition-transform group-hover:translate-x-1"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 