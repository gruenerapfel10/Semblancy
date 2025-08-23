"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mail, MapPin, Phone, Send, MessageSquare, Clock, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email anytime",
      value: "hello@semblancy.com",
      action: "mailto:hello@semblancy.com"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team",
      value: "Available 9AM-6PM EST",
      action: "#"
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us during business hours",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    }
  ]

  const faqs = [
    {
      question: "What are your support hours?",
      answer: "Our support team is available Monday through Friday, 9AM to 6PM EST. We typically respond to emails within 24 hours."
    },
    {
      question: "How can I reset my password?",
      answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. We'll send you instructions via email."
    },
    {
      question: "Do you offer educational discounts?",
      answer: "Yes! We offer special pricing for students and educators. Contact us with your .edu email for more information."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto max-w-6xl px-6 py-12">
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
              <Mail className="h-8 w-8 text-[#0046FF]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a question or need help? We&apos;re here to assist you with anything you need.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a
              key={index}
              href={method.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              className="block"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0046FF]/10 to-[#0046FF]/5 flex items-center justify-center flex-shrink-0">
                    <method.icon className="h-6 w-6 text-[#0046FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    <p className="text-[#0046FF] font-medium text-sm">{method.value}</p>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="rounded-2xl border-gray-200 focus:border-[#0046FF] focus:ring-[#0046FF]/20"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="rounded-2xl border-gray-200 focus:border-[#0046FF] focus:ring-[#0046FF]/20"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="rounded-2xl border-gray-200 focus:border-[#0046FF] focus:ring-[#0046FF]/20"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="rounded-2xl border-gray-200 focus:border-[#0046FF] focus:ring-[#0046FF]/20 min-h-[150px]"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-[#0046FF] hover:bg-[#0046FF]/90 text-white py-6"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0046FF]/10 to-[#0046FF]/5 rounded-3xl p-8 border border-[#0046FF]/10">
              <h3 className="font-semibold text-gray-900 mb-4">Office Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#0046FF]" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monday - Friday</p>
                    <p className="text-sm text-gray-600">9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-[#0046FF]" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Response Time</p>
                    <p className="text-sm text-gray-600">Within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#0046FF]" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">Remote - Worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}