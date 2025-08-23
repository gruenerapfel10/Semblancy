"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Book, MessageCircle, Video, FileText, Zap, Users, Settings, CreditCard, Shield, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics and set up your account",
      articles: 12,
      color: "from-blue-500/10 to-blue-500/5"
    },
    {
      icon: Zap,
      title: "Features & Tools",
      description: "Explore all features and how to use them",
      articles: 24,
      color: "from-purple-500/10 to-purple-500/5"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Work with classmates and study groups",
      articles: 8,
      color: "from-green-500/10 to-green-500/5"
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Manage your profile and preferences",
      articles: 15,
      color: "from-orange-500/10 to-orange-500/5"
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      description: "Subscription and payment information",
      articles: 10,
      color: "from-pink-500/10 to-pink-500/5"
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Keep your account safe and secure",
      articles: 7,
      color: "from-red-500/10 to-red-500/5"
    }
  ]

  const popularArticles = [
    {
      title: "How to create effective flashcards",
      category: "Features & Tools",
      readTime: "3 min"
    },
    {
      title: "Setting up your first study session",
      category: "Getting Started",
      readTime: "5 min"
    },
    {
      title: "Understanding spaced repetition",
      category: "Features & Tools",
      readTime: "4 min"
    },
    {
      title: "Inviting friends to study groups",
      category: "Collaboration",
      readTime: "2 min"
    },
    {
      title: "Customizing your learning preferences",
      category: "Account Settings",
      readTime: "3 min"
    },
    {
      title: "Upgrading to Premium",
      category: "Billing & Plans",
      readTime: "2 min"
    }
  ]

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      available: true
    },
    {
      icon: Video,
      title: "Video Tutorial",
      description: "Watch step-by-step guides and tutorials",
      action: "Watch Videos",
      available: true
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Browse our comprehensive documentation",
      action: "View Docs",
      available: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Button 
              variant="ghost" 
              className="mb-8 rounded-full px-6 hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0046FF]/10 to-[#0046FF]/5 mb-6">
              <HelpCircle className="h-8 w-8 text-[#0046FF]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How can we help?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Search our knowledge base or browse categories below
            </p>

            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for articles, tutorials, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 rounded-full text-base border-gray-200 focus:border-[#0046FF] focus:ring-[#0046FF]/20"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="h-6 w-6 text-[#0046FF]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <p className="text-xs text-[#0046FF] font-medium">{category.articles} articles</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
              <div className="space-y-4">
                {popularArticles.map((article, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-[#0046FF] transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{article.category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{article.readTime} read</span>
                      </div>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180 group-hover:text-[#0046FF] transition-colors" />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-6 rounded-full border-gray-200 hover:border-[#0046FF] hover:text-[#0046FF]"
              >
                View All Articles
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Need More Help?</h3>
              <div className="space-y-3">
                {supportOptions.map((option, index) => (
                  <div key={index} className="border border-gray-100 rounded-2xl p-4 hover:border-[#0046FF]/30 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0046FF]/10 to-[#0046FF]/5 flex items-center justify-center flex-shrink-0">
                        <option.icon className="h-5 w-5 text-[#0046FF]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{option.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-[#0046FF] text-xs mt-2"
                        >
                          {option.action} →
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0046FF]/10 to-[#0046FF]/5 rounded-3xl p-6 border border-[#0046FF]/10">
              <h3 className="font-semibold text-gray-900 mb-3">Can&apos;t find what you need?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is here to help you with any questions or issues.
              </p>
              <Link href="/contact">
                <Button className="w-full rounded-full bg-[#0046FF] hover:bg-[#0046FF]/90 text-white">
                  Contact Support
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">System Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Last checked 2 minutes ago</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}