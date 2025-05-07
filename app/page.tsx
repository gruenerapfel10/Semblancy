import { redirect } from 'next/navigation';
import { SiteFooter } from '@/components/footer';
import { SemblancyExactBento } from '@/components/semblancy-bento'; 
import { Hero } from '@/components/ui/hero';
import { Navbar } from '@/components/navbarHome';
import { CTASection } from '@/components/ui/cta-section';
import AnimatedTestimonialsDemo from '@/components/testimonials';
import { DualPanelSection } from '@/components/dual-panel-section';
import { NewsSection } from '@/components/ui/news-section';
import { newsItems } from '@/data/news-data';
import { MacOSWindow } from "@/components/ui/mac-os-window"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pt-10">
        <Navbar />
        <main>
          <Hero
            title="The only revision app you need"
            popWord="Semblancy"
            subtitle="The all-in-one revision app. Everything you need in one place, no other apps required."
            primaryCta={{
              text: "Get Started",
              href: "/signup",
            }}
            secondaryCta={{
              text: "Why We're Better",
              href: "/why-better",
            }}
            videoSrc="/4884238-uhd_2160_3840_30fps.mp4"
          />
          <SemblancyExactBento />
          
          {/* Testimonials Section */}
          <AnimatedTestimonialsDemo />
          
          {/* Dual Panel Section */}
          <DualPanelSection />
          
          {/* CTA Section before footer */}
          <CTASection 
            title="Ready to boost your grades?"
            headline="Start your revision journey today and excel in your exams"
            buttonText="Get started free"
            buttonHref="/signup"
          />
          
          {/* News Section */}
          <NewsSection items={newsItems} />
        </main>
      <SiteFooter />
    </div>
  );
} 