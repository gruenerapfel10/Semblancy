"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Clock, MapPin, ExternalLink, FileText, Shield, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function ContactPage() {

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
              <Mail className="h-10 w-10 text-[#0046FF]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Let&apos;s Connect
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 rounded-3xl p-8 border border-blue-200/50 dark:border-blue-800/50 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-background/50 dark:bg-background/30 backdrop-blur-sm flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Get in Touch</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Email Us</p>
                  <a href="mailto:gcsesimulator@gmail.com" className="inline-flex items-center gap-2 text-[#0046FF] hover:text-[#0046FF]/80 transition-colors">
                    <Mail className="h-4 w-4" />
                    gcsesimulator@gmail.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Response Time</p>
                  <p className="text-sm text-muted-foreground">We typically respond within 24-48 hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Based in</p>
                  <p className="text-sm text-muted-foreground">United Kingdom</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-card rounded-3xl p-8 shadow-sm border h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-foreground/70" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Office Hours</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Monday - Friday</p>
                  <p className="text-lg text-muted-foreground">9:00 AM - 6:00 PM GMT</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    For urgent matters, please include &quot;URGENT&quot; in your email subject line for prioritized response.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 rounded-3xl p-8 border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-background/50 dark:bg-background/30 backdrop-blur-sm flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Quick Links</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Find helpful resources and learn more about our policies
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/support">
                <Button variant="outline" className="w-full rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Support Center
                </Button>
              </Link>
              <Link href="/tos">
                <Button variant="outline" className="w-full rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                  <FileText className="mr-2 h-4 w-4" />
                  Terms of Service
                </Button>
              </Link>
              <Link href="/privacy">
                <Button variant="outline" className="w-full rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
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