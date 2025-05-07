"use client"

import { useEffect, useState, useRef } from "react"
import type * as React from "react"
import Link from "next/link"
import { ArrowRight, Users, Activity, Clock, CheckCircle, Sparkles, BookOpen } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DotBackground from "@/components/ui/dot-background"
import { Typewriter } from "@/components/ui/typewriter"
import { FadeIn } from "@/components/ui/fade-in"
import { VideoPlayer } from "@/components/ui/video-player"

export interface HeroProps {
  /** Main headline text */
  title?: string
  /** Word to highlight in the title */
  highlightWord?: string
  /** Subtitle or description text */
  subtitle?: string
  /** Primary call-to-action button text */
  primaryCta?: {
    text: string
    href: string
  }
  /** Secondary call-to-action button text */
  secondaryCta?: {
    text: string
    href: string
  }
  /** Additional content to display below the showcase */
  bottomContent?: React.ReactNode
  /** Video source for the showcase */
  videoSrc?: string
  /** Whether to animate the text */
  animateText?: boolean
  /** Additional CSS classes for the container */
  className?: string
  /** Pop word to highlight with gradient */
  popWord?: string
}

export function Hero({
  title = "Semblancy",
  highlightWord,
  subtitle = "The all-in-one revision app. Everything you need in one place, no other apps required.",
  primaryCta = {
    text: "Get Started",
    href: "/signup"
  },
  secondaryCta = {
    text: "Why We're Better",
    href: "/why-better"
  },
  bottomContent,
  videoSrc = "/4884238-uhd_2160_3840_30fps.mp4",
  animateText = true,
  className,
  popWord = "Semblancy", // Default pop word
}: HeroProps) {
  // State for scroll animation
  const [scrolled, setScrolled] = useState(false)
  
  // Refs for parallax effect
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Handle mouse move for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!videoContainerRef.current) return
    
    const rect = videoContainerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    
    setMousePosition({ x, y })
  }

  // Key features for reinforcement sections
  const keyFeatures = [
    { 
      title: "100K+ Users", 
      icon: <Users className="h-5 w-5 text-primary" />,
      description: "Trusted by students worldwide"
    },
    { 
      title: "All-in-One Solution", 
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
      description: "No need for multiple revision apps"
    },
    { 
      title: "24/7 Support", 
      icon: <Clock className="h-5 w-5 text-primary" />,
      description: "Help available whenever you need it"
    },
  ]

  // Function to render title with pop word styled with gradient
  const renderTitle = () => {
    if (!popWord || !title.includes(popWord)) {
      return title;
    }

    const parts = title.split(popWord);
    return (
      <>
        {parts[0]}
        <span className="relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#ff0046] to-[#9896f0] font-black animate-pulse">
          {popWord}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="relative w-full">
      <DotBackground 
        className={cn(
          "relative z-0 py-0 flex items-center min-h-screen backdrop-blur-sm", 
          scrolled ? "dot-fade" : "",
          className
        )}
      >
        <div className="container relative mx-auto px-6 max-w-[1400px] z-10 flex flex-col items-center justify-center py-10 lg:py-20">
          {/* Text content - centered above video */}
          <div className="w-full text-center mb-10">
            {animateText ? (
              <>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] pb-4 max-w-none">
                  <Typewriter 
                    words={title} 
                    speed={30} 
                    cursor={true} 
                    align="center"
                    onComplete={() => {}} // Empty function, handled by subtitle delay
                  />
                  {!animateText && renderTitle()}
                </h1>
                {/* Subtitle with calculated delay */}
                <FadeIn 
                  show={true} 
                  direction="up" 
                  className="mt-6 text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto"
                  delay={calculateTypeDelay(title, 30) + 0.3}
                >
                  {subtitle}
                </FadeIn>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] pb-4 max-w-none">
                  {renderTitle()}
                </h1>
                <p className="mt-6 text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
                  {subtitle}
                </p>
              </>
            )}

            {/* CTA buttons with improved hover effects */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              {primaryCta && (
                <FadeIn delay={animateText ? calculateTypeDelay(title, 30) + 0.6 : 0} direction="up">
                  <Button 
                    asChild 
                    size="lg" 
                    className="rounded-full text-lg px-8 py-6 h-auto bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/20"
                  >
                    <Link href={primaryCta.href} className="flex items-center gap-2">
                      {primaryCta.text}
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Link>
                  </Button>
                </FadeIn>
              )}

              {secondaryCta && (
                <FadeIn delay={animateText ? calculateTypeDelay(title, 30) + 0.8 : 0} direction="up">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full text-lg px-7 py-6 h-auto border-foreground/20 hover:border-foreground/40 hover:scale-105 transition-all duration-300"
                  >
                    <Link href={secondaryCta.href || "/why-better"}>{secondaryCta.text}</Link>
                  </Button>
                </FadeIn>
              )}
            </div>
          </div>

          {/* Video content - centered below text */}
          <div 
            className="w-full mx-auto mb-16"
            ref={videoContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
          >
            <FadeIn 
              delay={animateText ? 0.5 : 0} 
              direction="up" 
            >
              <div 
                className="relative rounded-xl overflow-hidden shadow-2xl border border-foreground/10 transform transition-transform duration-200"
                style={{ 
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * -5}deg) scale(1.02)`,
                  transition: 'all 0.2s ease-out'
                }}
              >
                <VideoPlayer 
                  src={videoSrc} 
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/30 to-transparent pointer-events-none"></div>
              </div>
            </FadeIn>
          </div>

          {/* Feature reinforcement cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {keyFeatures.map((feature, index) => (
              <FadeIn 
                key={index} 
                delay={animateText ? 1.2 + (index * 0.1) : 0} 
                direction="up"
              >
                <Card className="p-6 flex flex-col items-center text-center h-full group hover:shadow-lg transition-all duration-300 border border-border/50 bg-background/50 backdrop-blur-sm">
                  <div className="mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </DotBackground>
    </div>
  )
}

// Helper function to calculate typing delay based on text length
function calculateTypeDelay(text: string, speed: number): number {
  return (text.length * speed) / 1000;
}

