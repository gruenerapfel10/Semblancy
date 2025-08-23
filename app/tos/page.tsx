"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Scale } from "lucide-react"
import { motion } from "framer-motion"

export default function TermsPage() {
  const sections = [
    {
      title: "1. Agreement to Terms",
      content: "These Terms of Service constitute a legally binding agreement between you and Semblancy Ltd (\"we,\" \"us,\" or \"our\") governing your use of the Semblancy web application and services. By accessing or using Semblancy, you agree to be bound by these Terms. If you disagree with any part of these terms, you must not access our service. These Terms apply to all visitors, users, and others who access or use the Service."
    },
    {
      title: "2. Service Description",
      content: "Semblancy is a UK-based educational technology platform providing AI-powered study tools, revision materials, and learning resources for students. Our service includes interactive flashcards, practice examinations, progress tracking, and personalised learning experiences designed to enhance educational outcomes. The Service is operated from and governed by the laws of the United Kingdom."
    },
    {
      title: "3. Eligibility and Account Registration",
      subsections: [
        {
          subtitle: "Age Requirements",
          content: "You must be at least 13 years of age to use Semblancy. If you are under 18, you must have parental or guardian consent to use our services. By using Semblancy, you represent that you meet these age requirements."
        },
        {
          subtitle: "Account Security",
          content: "You are responsible for safeguarding your password and account credentials. You agree to accept responsibility for all activities that occur under your account. You must immediately notify us of any breach of security or unauthorised use of your account."
        },
        {
          subtitle: "Account Accuracy",
          content: "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete."
        }
      ]
    },
    {
      title: "4. Acceptable Use Policy",
      content: "You agree to use Semblancy only for lawful purposes and in accordance with these Terms. You agree not to:",
      list: [
        "Violate any applicable UK or international laws or regulations",
        "Transmit any material that is defamatory, offensive, or otherwise objectionable",
        "Impersonate or attempt to impersonate another user or person",
        "Engage in any conduct that restricts or inhibits anyone's use of the Service",
        "Use the Service for any commercial purposes without our express written consent",
        "Introduce viruses, trojans, worms, or other malicious code",
        "Attempt to gain unauthorised access to any portion of the Service",
        "Collect or store personal data about other users without their consent",
        "Use automated systems or software to extract data from the Service",
        "Share your account credentials or allow multiple people to use a single account"
      ]
    },
    {
      title: "5. Content and Intellectual Property Rights",
      subsections: [
        {
          subtitle: "Our Content",
          content: "The Service and its original content, features, and functionality are owned by Semblancy Ltd and are protected by UK and international copyright, trademark, patent, trade secret, and other intellectual property laws."
        },
        {
          subtitle: "User Content",
          content: "You retain ownership of any content you create using our Service. By creating content, you grant us a worldwide, non-exclusive, royalty-free licence to use, reproduce, and display such content solely for the purpose of operating and improving the Service."
        },
        {
          subtitle: "Educational Materials",
          content: "Study materials and resources provided through Semblancy are for personal educational use only. Commercial redistribution or resale of our materials is strictly prohibited without written consent."
        }
      ]
    },
    {
      title: "6. Payment Terms",
      subsections: [
        {
          subtitle: "Subscription Services",
          content: "Some aspects of the Service may be subject to payment. You agree to provide current, complete, and accurate purchase and account information for all purchases. Prices are in GBP unless otherwise specified."
        },
        {
          subtitle: "Billing",
          content: "Subscription fees are billed in advance on a recurring basis (monthly or annually). You authorise us to charge your payment method for all fees payable."
        },
        {
          subtitle: "Cancellation and Refunds",
          content: "You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. We offer refunds in accordance with UK consumer protection laws."
        }
      ]
    },
    {
      title: "7. Privacy and Data Protection",
      content: "Your use of Semblancy is also governed by our Privacy Policy, which complies with UK GDPR and the Data Protection Act 2018. We collect only data necessary for providing our educational services and protect it in accordance with UK data protection laws. Please review our Privacy Policy to understand our practices regarding your personal information."
    },
    {
      title: "8. Disclaimers and Limitation of Liability",
      subsections: [
        {
          subtitle: "Educational Content Disclaimer",
          content: "Semblancy provides educational support tools but does not guarantee specific academic outcomes. Our content is meant to supplement, not replace, formal education."
        },
        {
          subtitle: "Service Availability",
          content: "We strive to provide uninterrupted service but cannot guarantee the Service will be available at all times. We may experience hardware, software, or other problems requiring maintenance."
        },
        {
          subtitle: "Limitation of Liability",
          content: "To the maximum extent permitted by UK law, Semblancy Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly."
        }
      ]
    },
    {
      title: "9. Indemnification",
      content: "You agree to defend, indemnify, and hold harmless Semblancy Ltd, its officers, directors, employees, and agents, from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of the Service."
    },
    {
      title: "10. Termination",
      subsections: [
        {
          subtitle: "Termination by You",
          content: "You may terminate your account at any time by contacting us at support@semblancy.com or through your account settings."
        },
        {
          subtitle: "Termination by Us",
          content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms."
        },
        {
          subtitle: "Effect of Termination",
          content: "Upon termination, your right to use the Service will cease immediately. All provisions of these Terms which should reasonably survive termination shall survive."
        }
      ]
    },
    {
      title: "11. Governing Law and Dispute Resolution",
      subsections: [
        {
          subtitle: "Governing Law",
          content: "These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions."
        },
        {
          subtitle: "Dispute Resolution",
          content: "Any dispute arising from these Terms shall be resolved through good faith negotiations. If resolution cannot be reached, disputes shall be submitted to the exclusive jurisdiction of the courts of England and Wales."
        }
      ]
    },
    {
      title: "12. Changes to Terms",
      content: "We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms."
    },
    {
      title: "13. Contact Information",
      content: "For any questions about these Terms of Service, please contact us:",
      contact: {
        email: "legal@semblancy.com",
        address: "Semblancy Ltd, United Kingdom"
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto max-w-4xl px-6 py-12">
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
              <Scale className="h-8 w-8 text-[#0046FF]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h2>
                
                {section.content && !section.list && !section.subsections && !section.contact && (
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                )}

                {section.subsections && (
                  <div className="space-y-4">
                    {section.subsections.map((sub, subIndex) => (
                      <div key={subIndex} className="bg-gradient-to-r from-[#0046FF]/5 to-transparent rounded-2xl p-6">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {sub.subtitle}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {sub.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {section.list && (
                  <>
                    <p className="text-gray-600 mb-4">{section.content}</p>
                    <ul className="space-y-2">
                      {section.list.map((item, listIndex) => (
                        <li key={listIndex} className="flex items-start">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#0046FF] mt-2 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {section.contact && (
                  <>
                    <p className="text-gray-600 mb-4">{section.content}</p>
                    <div className="space-y-3 bg-gradient-to-r from-[#0046FF]/5 to-transparent rounded-2xl p-6">
                      <div className="flex items-center">
                        <span className="text-gray-900 font-medium mr-2">Email:</span>
                        <span className="text-[#0046FF]">{section.contact.email}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-medium mr-2">Address:</span>
                        <span className="text-gray-600">{section.contact.address}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}