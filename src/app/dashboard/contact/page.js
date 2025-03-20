"use client";
import { useState } from "react";
import styles from "./contact.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faComments,
  faPaperPlane,
  faQuestionCircle,
  faBook,
  faWrench,
  faFileAlt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function Contact() {
  const [contactMethod, setContactMethod] = useState("email");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setCategory("");
        setSubject("");
        setMessage("");
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  // FAQ data
  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        "To reset your password, click the 'Forgot Password' link on the login page. Follow the instructions sent to your registered email address.",
    },
    {
      question: "Can I access the platform on mobile devices?",
      answer:
        "Yes, our platform is fully responsive and works on all mobile devices including smartphones and tablets.",
    },
    {
      question: "How do I track my progress?",
      answer:
        "Your progress is automatically tracked in the Dashboard. Visit the Overview page to see detailed statistics and progress charts.",
    },
    {
      question:
        "Are there any limits to the number of practice questions I can access?",
      answer:
        "No, you have unlimited access to all practice questions within your subscription plan.",
    },
    {
      question: "How often are new resources added?",
      answer:
        "We update our content regularly, with new resources typically added on a weekly basis. Major updates are announced in the Changelog section.",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contact Support</h1>
        <p className={styles.subtitle}>
          Get help with any questions or issues you may have
        </p>
      </div>

      <div className={styles.contactContent}>
        <div className={styles.contactOptions}>
          <div className={styles.contactMethods}>
            <h2 className={styles.sectionTitle}>Contact Methods</h2>

            <div className={styles.methodsGrid}>
              <div
                className={`${styles.methodCard} ${
                  contactMethod === "email" ? styles.activeMethod : ""
                }`}
                onClick={() => setContactMethod("email")}
              >
                <div className={styles.methodIcon}>
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <h3 className={styles.methodTitle}>Email</h3>
                <p className={styles.methodDescription}>
                  Send us an email and we'll respond within 24 hours
                </p>
              </div>

              <div
                className={`${styles.methodCard} ${
                  contactMethod === "phone" ? styles.activeMethod : ""
                }`}
                onClick={() => setContactMethod("phone")}
              >
                <div className={styles.methodIcon}>
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <h3 className={styles.methodTitle}>Phone</h3>
                <p className={styles.methodDescription}>
                  Call our support team during business hours
                </p>
              </div>

              <div
                className={`${styles.methodCard} ${
                  contactMethod === "chat" ? styles.activeMethod : ""
                }`}
                onClick={() => setContactMethod("chat")}
              >
                <div className={styles.methodIcon}>
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <h3 className={styles.methodTitle}>Live Chat</h3>
                <p className={styles.methodDescription}>
                  Chat with our support team in real-time
                </p>
              </div>
            </div>
          </div>

          <div className={styles.faqSection}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>

            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <div key={index} className={styles.faqItem}>
                  <div className={styles.faqQuestion}>
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className={styles.faqIcon}
                    />
                    <h3>{faq.question}</h3>
                  </div>
                  <div className={styles.faqAnswer}>{faq.answer}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.contactForm}>
          <h2 className={styles.formTitle}>
            {contactMethod === "email"
              ? "Send us an email"
              : contactMethod === "phone"
              ? "Request a callback"
              : "Start a chat"}
          </h2>

          {isSubmitted ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <h3>Thank you for contacting us!</h3>
              <p>We've received your message and will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="category">Category:</label>
                <div className={styles.selectWrapper}>
                  <select
                    id="category"
                    className={styles.formSelect}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="account">Account Issues</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Subscription</option>
                    <option value="content">Content Questions</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject:</label>
                <input
                  type="text"
                  id="subject"
                  className={styles.formInput}
                  placeholder="Briefly describe your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  className={styles.formTextarea}
                  placeholder="Please provide details about your issue or question"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              {contactMethod === "email" && (
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address:</label>
                  <input
                    type="email"
                    id="email"
                    className={styles.formInput}
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {contactMethod === "phone" && (
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number:</label>
                  <input
                    type="tel"
                    id="phone"
                    className={styles.formInput}
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>
                      {contactMethod === "email"
                        ? "Send Message"
                        : contactMethod === "phone"
                        ? "Request Call"
                        : "Start Chat"}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className={styles.helpResources}>
            <h3 className={styles.resourcesTitle}>Additional Resources</h3>

            <div className={styles.resourcesList}>
              <a href="#" className={styles.resourceLink}>
                <FontAwesomeIcon
                  icon={faBook}
                  className={styles.resourceIcon}
                />
                <span>Knowledge Base</span>
              </a>
              <a href="#" className={styles.resourceLink}>
                <FontAwesomeIcon
                  icon={faWrench}
                  className={styles.resourceIcon}
                />
                <span>System Status</span>
              </a>
              <a href="#" className={styles.resourceLink}>
                <FontAwesomeIcon
                  icon={faFileAlt}
                  className={styles.resourceIcon}
                />
                <span>User Guides</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
