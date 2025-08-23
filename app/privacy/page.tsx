"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from "lucide-react"
import { motion } from "framer-motion"

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Data Controller Information",
      content: "Semblancy Ltd is the data controller responsible for your personal data. We are a UK-based educational technology company committed to protecting your privacy in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.",
      contact: {
        company: "Semblancy Ltd",
        email: "privacy@semblancy.com",
        dpo: "Data Protection Officer",
        address: "United Kingdom"
      }
    },
    {
      title: "2. Information We Collect",
      content: "We collect only the minimum personal data necessary to provide our educational services effectively. The types of information we collect include:",
      items: [
        "Account Information: Name, email address, encrypted password",
        "Educational Profile: Year of study, subjects, educational institution (optional)",
        "Learning Data: Study progress, flashcard performance, practice test results",
        "Technical Data: IP address, browser type, device information, cookies",
        "Usage Data: How you interact with our platform, features used, time spent",
        "Communication Data: Support queries, feedback, survey responses"
      ]
    },
    {
      title: "3. Legal Basis for Processing",
      content: "We process your personal data only when we have a legal basis to do so under UK GDPR:",
      items: [
        "Contract: Processing necessary to provide our services under our Terms of Service",
        "Legitimate Interests: Improving our services, preventing fraud, ensuring security",
        "Consent: Where you have given explicit consent for specific processing",
        "Legal Obligation: When required by law or court order",
        "Vital Interests: In rare cases where processing is necessary to protect someone's life"
      ]
    },
    {
      title: "4. How We Use Your Information",
      content: "We use your personal data solely for the following purposes:",
      items: [
        "Providing Educational Services: Delivering personalised learning experiences and study tools",
        "Account Management: Creating and managing your account, authentication",
        "Service Improvement: Analysing usage patterns to enhance platform features",
        "Communication: Sending service updates, responding to enquiries, technical support",
        "Legal Compliance: Meeting our legal and regulatory obligations",
        "Security: Protecting against unauthorised access, fraud, and abuse"
      ]
    },
    {
      title: "5. Data Sharing and Disclosure",
      content: "We do not sell, rent, or trade your personal data. We share information only in these limited circumstances:",
      items: [
        "Service Providers: Carefully vetted third parties who help operate our service (hosting, analytics)",
        "Legal Requirements: When required by law, court order, or governmental request",
        "Vital Interests: To protect the vital interests of you or another person",
        "Business Transfer: In the event of merger, acquisition, or sale of assets",
        "With Consent: When you explicitly authorise us to share information"
      ]
    },
    {
      title: "6. Data Security Measures",
      content: "We implement robust technical and organisational measures to protect your personal data:",
      highlights: [
        "Encryption: All data transmitted using TLS/SSL, sensitive data encrypted at rest",
        "Access Controls: Role-based access, multi-factor authentication for staff",
        "Regular Audits: Security assessments and penetration testing",
        "Data Minimisation: We collect only necessary data and delete when no longer needed",
        "Staff Training: Regular GDPR and security training for all employees",
        "Incident Response: Established procedures for data breach detection and notification"
      ]
    },
    {
      title: "7. Your Rights Under UK GDPR",
      content: "You have the following rights regarding your personal data:",
      items: [
        "Right to Access: Request a copy of your personal data we hold",
        "Right to Rectification: Request correction of inaccurate or incomplete data",
        "Right to Erasure: Request deletion of your data ('right to be forgotten')",
        "Right to Restrict Processing: Request limitation of processing in certain circumstances",
        "Right to Data Portability: Receive your data in a structured, machine-readable format",
        "Right to Object: Object to processing based on legitimate interests or direct marketing",
        "Right to Withdraw Consent: Withdraw consent at any time where processing is based on consent",
        "Right to Complain: Lodge a complaint with the Information Commissioner's Office (ICO)"
      ]
    },
    {
      title: "8. Data Retention",
      content: "We retain personal data only for as long as necessary to fulfil the purposes for which it was collected:",
      items: [
        "Active Accounts: Data retained while account is active and you use our services",
        "Inactive Accounts: Accounts inactive for 2 years may be deleted after notification",
        "After Deletion: Some data may be retained for legal compliance (maximum 7 years)",
        "Learning Analytics: Anonymised aggregate data may be retained for research purposes",
        "Marketing: Unsubscribe requests processed immediately, suppression list maintained"
      ]
    },
    {
      title: "9. Cookies and Tracking Technologies",
      content: "We use cookies and similar technologies to enhance your experience:",
      items: [
        "Essential Cookies: Required for platform functionality and security",
        "Performance Cookies: Help us understand how users interact with our service",
        "Functional Cookies: Remember your preferences and settings",
        "Analytics Cookies: Used to improve our service (can be disabled)",
        "Cookie Control: You can manage cookies through your browser settings"
      ]
    },
    {
      title: "10. Children's Privacy",
      content: "We take special care with children's data in compliance with UK data protection laws. Users under 13 require parental consent. For users aged 13-18, we implement additional safeguards including limited data collection, enhanced privacy settings, and no targeted advertising. Parents can request access to their child's data and request deletion."
    },
    {
      title: "11. International Data Transfers",
      content: "As a UK-based service, we primarily process data within the UK. Any international transfers are conducted with appropriate safeguards:",
      items: [
        "Adequacy Decisions: Transfers to countries deemed adequate by the UK government",
        "Standard Contractual Clauses: UK-approved contractual protections for data transfers",
        "Your Rights: You can request information about transfer safeguards at any time"
      ]
    },
    {
      title: "12. Automated Decision-Making",
      content: "We use automated processing to personalise your learning experience (e.g., recommending study materials based on performance). This processing does not produce legal effects or similarly significantly affect you. You have the right to request human review of any automated decisions."
    },
    {
      title: "13. Changes to This Policy",
      content: "We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material changes will be notified via email or prominent notice on our platform at least 30 days before taking effect. Your continued use after changes constitutes acceptance."
    },
    {
      title: "14. Contact Us",
      content: "For any privacy concerns, questions, or to exercise your rights, please contact us:",
      contact: {
        email: "privacy@semblancy.com",
        dpo: "dpo@semblancy.com",
        address: "Semblancy Ltd, United Kingdom",
        ico: "UK Information Commissioner's Office: ico.org.uk"
      }
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-6 py-12">
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

          <div className="mb-12 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0046FF]/10 to-[#0046FF]/5 dark:from-[#0046FF]/20 dark:to-[#0046FF]/10 mb-8"
            >
              <Shield className="h-10 w-10 text-[#0046FF]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-[#0046FF]/10 to-[#0046FF]/5 dark:from-[#0046FF]/20 dark:to-[#0046FF]/10 rounded-3xl p-8 mb-8 border border-[#0046FF]/20 dark:border-[#0046FF]/30"
        >
          <p className="text-muted-foreground leading-relaxed">
            This Privacy Policy explains how Semblancy Ltd collects, uses, and protects your personal data in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We are committed to ensuring your privacy and giving you control over your personal information.
          </p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
            >
              <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {section.title}
                </h2>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {section.content}
                </p>

                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#0046FF] mt-2 mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.highlights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {section.highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="bg-gradient-to-r from-[#0046FF]/5 dark:from-[#0046FF]/10 to-transparent rounded-2xl p-4">
                        <span className="text-muted-foreground text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.contact && (
                  <div className="space-y-3 bg-gradient-to-r from-[#0046FF]/5 dark:from-[#0046FF]/10 to-transparent rounded-2xl p-6 mt-4">
                    {section.contact.company && (
                      <div className="flex items-center">
                        <span className="text-foreground font-medium mr-2">Company:</span>
                        <span className="text-muted-foreground">{section.contact.company}</span>
                      </div>
                    )}
                    {section.contact.email && (
                      <div className="flex items-center">
                        <span className="text-foreground font-medium mr-2">Email:</span>
                        <span className="text-[#0046FF]">{section.contact.email}</span>
                      </div>
                    )}
                    {section.contact.dpo && (
                      <div className="flex items-center">
                        <span className="text-foreground font-medium mr-2">DPO Email:</span>
                        <span className="text-[#0046FF]">{section.contact.dpo === "Data Protection Officer" ? section.contact.dpo : section.contact.dpo}</span>
                      </div>
                    )}
                    {section.contact.address && (
                      <div className="flex items-center">
                        <span className="text-foreground font-medium mr-2">Address:</span>
                        <span className="text-muted-foreground">{section.contact.address}</span>
                      </div>
                    )}
                    {section.contact.ico && (
                      <div className="flex items-center">
                        <span className="text-foreground font-medium mr-2">Regulator:</span>
                        <span className="text-muted-foreground">{section.contact.ico}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}