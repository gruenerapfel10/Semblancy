"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageCircle, Shield, FileText, HelpCircle, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

export default function SupportPage() {
  const supportLinks = [
    {
      icon: MessageCircle,
      title: "Contact Us",
      description: "Get in touch with our support team for help with any questions or issues",
      href: "/contact",
      color: "blue"
    },
    {
      icon: FileText,
      title: "Terms of Service",
      description: "Read our terms and conditions for using the Semblancy platform",
      href: "/tos",
      color: "purple"
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      description: "Learn how we protect and handle your personal information",
      href: "/privacy",
      color: "green"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500/10 to-blue-600/5 border-blue-200/50 hover:border-blue-300 dark:from-blue-500/20 dark:to-blue-600/10 dark:border-blue-800/50 dark:hover:border-blue-700",
      purple: "from-purple-500/10 to-purple-600/5 border-purple-200/50 hover:border-purple-300 dark:from-purple-500/20 dark:to-purple-600/10 dark:border-purple-800/50 dark:hover:border-purple-700",
      green: "from-green-500/10 to-green-600/5 border-green-200/50 hover:border-green-300 dark:from-green-500/20 dark:to-green-600/10 dark:border-green-800/50 dark:hover:border-green-700"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400",
      purple: "text-purple-600 dark:text-purple-400",
      green: "text-green-600 dark:text-green-400"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Button 
              variant="ghost" 
              className="mb-8 rounded-full px-6 hover:bg-muted transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="mb-16 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0046FF]/10 to-[#0046FF]/5 dark:from-[#0046FF]/20 dark:to-[#0046FF]/10 mb-8"
            >
              <HelpCircle className="h-10 w-10 text-[#0046FF]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Support Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find helpful resources and get in touch with our team
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {supportLinks.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Link href={link.href}>
                <div className={`relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br ${getColorClasses(link.color)} border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full`}>
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-background/50 dark:bg-background/30 backdrop-blur-sm mb-6`}>
                      <link.icon className={`h-7 w-7 ${getIconColorClasses(link.color)}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {link.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-[#0046FF] dark:text-blue-400">
                      Visit Page
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-background/20 to-background/5 blur-2xl" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex flex-col items-center p-8 rounded-3xl bg-muted/30 dark:bg-muted/10 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Need immediate assistance?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Our support team is available Monday to Friday, 9 AM to 6 PM GMT
            </p>
            <Link href="/contact">
              <Button 
                size="lg" 
                className="rounded-full bg-[#0046FF] hover:bg-[#0046FF]/90 text-white px-8"
              >
                Contact Support Team
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center text-sm text-muted-foreground"
        >
          <p>
            Semblancy Education Platform • Supporting your learning journey
          </p>
        </motion.div>
      </div>
    </div>
  )
}