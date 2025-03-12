"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./how-it-works.module.css";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const workflowRef = useRef(null);
  
  // Animation observer for scroll-based animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.animated);
        }
      });
    }, { threshold: 0.2 });
    
    const elements = document.querySelectorAll(`.${styles.animateOnScroll}`);
    elements.forEach(el => observer.observe(el));
    
    return () => elements.forEach(el => observer.unobserve(el));
  }, []);
  
  // Handle workflow step animation
  const handleWorkflowStep = (step) => {
    setActiveTab(step);
    const progressBar = document.querySelector(`.${styles.progressBar}`);
    progressBar.style.width = `${(step + 1) * 25}%`;
  };
  
  // Toggle FAQ item
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section with Animation */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>How Prosemble Works</h1>
          <p className={styles.heroSubtitle}>
            Transform your data into powerful ML predictions with our AI-driven platform
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.primaryButton}>Get Started</button>
            <button className={styles.secondaryButton}>Watch Demo</button>
          </div>
        </div>
        <div className={styles.heroAnimation}>
          <div className={styles.animationElement}></div>
          <div className={styles.animationElement}></div>
          <div className={styles.animationElement}></div>
          <div className={styles.floatingData}>
            <div className={styles.dataPoint}></div>
            <div className={styles.dataPoint}></div>
            <div className={styles.dataPoint}></div>
            <div className={styles.dataPoint}></div>
            <div className={styles.dataPoint}></div>
          </div>
        </div>
      </div>

      {/* Feature Grid Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>What Prosemble Does For You</h2>
        <p className={styles.sectionSubtitle}>
          Our platform streamlines the process of turning your biochemical data into accurate predictions
        </p>
        
        <div className={styles.featureGrid}>
          <div className={`${styles.featureCard} ${styles.animateOnScroll}`}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <h3>Data Organization</h3>
            <p>Upload, organize, and manage your biochemical datasets in one secure place</p>
          </div>
          
          <div className={`${styles.featureCard} ${styles.animateOnScroll}`}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>AI Analysis</h3>
            <p>Our specialized ML models analyze your data to find patterns and make predictions</p>
          </div>
          
          <div className={`${styles.featureCard} ${styles.animateOnScroll}`}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="8 14 12 16 16 14"></polyline>
                <polyline points="8 10 12 12 16 10"></polyline>
                <line x1="12" y1="12" x2="12" y2="16"></line>
              </svg>
            </div>
            <h3>Predictive Results</h3>
            <p>Get accurate predictions and valuable insights based on your real biochemical data</p>
          </div>
          
          <div className={`${styles.featureCard} ${styles.animateOnScroll}`}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
                <circle cx="16" cy="16" r="3"></circle>
              </svg>
            </div>
            <h3>Visual Reports</h3>
            <p>Visualize your data and results with interactive graphs and detailed reports</p>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section className={styles.workflowSection} ref={workflowRef}>
        <h2 className={styles.sectionTitle}>The Prosemble Workflow</h2>
        <p className={styles.sectionSubtitle}>
          Four simple steps to transform your data into powerful predictions
        </p>
        
        <div className={styles.workflowContainer}>
          <div className={styles.workflowTabs}>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar}></div>
              <div className={styles.progressMarkers}>
                <div className={`${styles.marker} ${activeTab >= 0 ? styles.active : ''}`} onClick={() => handleWorkflowStep(0)}></div>
                <div className={`${styles.marker} ${activeTab >= 1 ? styles.active : ''}`} onClick={() => handleWorkflowStep(1)}></div>
                <div className={`${styles.marker} ${activeTab >= 2 ? styles.active : ''}`} onClick={() => handleWorkflowStep(2)}></div>
                <div className={`${styles.marker} ${activeTab >= 3 ? styles.active : ''}`} onClick={() => handleWorkflowStep(3)}></div>
              </div>
            </div>
            
            <div className={styles.workflowButtons}>
              <button 
                className={`${styles.workflowButton} ${activeTab === 0 ? styles.active : ''}`}
                onClick={() => handleWorkflowStep(0)}
              >
                1. Create Project
              </button>
              <button 
                className={`${styles.workflowButton} ${activeTab === 1 ? styles.active : ''}`}
                onClick={() => handleWorkflowStep(1)}
              >
                2. Upload Data
              </button>
              <button 
                className={`${styles.workflowButton} ${activeTab === 2 ? styles.active : ''}`}
                onClick={() => handleWorkflowStep(2)}
              >
                3. AI Processing
              </button>
              <button 
                className={`${styles.workflowButton} ${activeTab === 3 ? styles.active : ''}`}
                onClick={() => handleWorkflowStep(3)}
              >
                4. Get Results
              </button>
            </div>
          </div>
          
          <div className={styles.workflowContent}>
            <div className={`${styles.workflowPanel} ${activeTab === 0 ? styles.active : ''}`}>
              <div className={styles.panelContent}>
                <h3>Create Your Project</h3>
                <p>Start by creating a new project and defining your prediction goals. Name your project, add a description, and set up the parameters for your biochemical analysis.</p>
                <ul className={styles.stepFeatures}>
                  <li>Simple project creation</li>
                  <li>Customizable parameters</li>
                  <li>Secure project storage</li>
                </ul>
              </div>
              <div className={styles.panelVisual}>
                <div className={styles.createProjectAnimation}>
                  <div className={styles.projectCard}></div>
                  <div className={styles.projectForm}></div>
                </div>
              </div>
            </div>
            
            <div className={`${styles.workflowPanel} ${activeTab === 1 ? styles.active : ''}`}>
              <div className={styles.panelContent}>
                <h3>Upload Your Data</h3>
                <p>Import your biochemical data files. We support CSV, Excel, and other common data formats. Organize your data and prepare it for AI processing.</p>
                <ul className={styles.stepFeatures}>
                  <li>Supports multiple file formats</li>
                  <li>Bulk upload capability</li>
                  <li>Automatic data validation</li>
                </ul>
              </div>
              <div className={styles.panelVisual}>
                <div className={styles.uploadAnimation}>
                  <div className={styles.fileIcon}></div>
                  <div className={styles.uploadArrow}></div>
                  <div className={styles.platformIcon}></div>
                </div>
              </div>
            </div>
            
            <div className={`${styles.workflowPanel} ${activeTab === 2 ? styles.active : ''}`}>
              <div className={styles.panelContent}>
                <h3>AI Processes Your Data</h3>
                <p>Our specialized machine learning models analyze your data, identifying patterns and generating accurate predictions specific to biochemical properties.</p>
                <ul className={styles.stepFeatures}>
                  <li>Advanced ML algorithms</li>
                  <li>Biochemical-specific models</li>
                  <li>High accuracy predictions</li>
                </ul>
              </div>
              <div className={styles.panelVisual}>
                <div className={styles.processingAnimation}>
                  <div className={styles.dataNode}></div>
                  <div className={styles.processingNode}></div>
                  <div className={styles.aiNode}></div>
                  <div className={styles.processingPath1}></div>
                  <div className={styles.processingPath2}></div>
                </div>
              </div>
            </div>
            
            <div className={`${styles.workflowPanel} ${activeTab === 3 ? styles.active : ''}`}>
              <div className={styles.panelContent}>
                <h3>Get Your Results</h3>
                <p>View and download comprehensive reports with accurate predictions, visualizations, and actionable insights from your biochemical data.</p>
                <ul className={styles.stepFeatures}>
                  <li>Interactive visualizations</li>
                  <li>Downloadable reports</li>
                  <li>Data-driven recommendations</li>
                </ul>
              </div>
              <div className={styles.panelVisual}>
                <div className={styles.resultsAnimation}>
                  <div className={styles.chartBar1}></div>
                  <div className={styles.chartBar2}></div>
                  <div className={styles.chartBar3}></div>
                  <div className={styles.reportIcon}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className={`${styles.useCasesSection} ${styles.animateOnScroll}`}>
        <h2 className={styles.sectionTitle}>What You Can Do With Prosemble</h2>
        
        <div className={styles.useCasesGrid}>
          <div className={styles.useCase}>
            <div className={styles.useCaseIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <h3>Molecule Property Prediction</h3>
            <p>Predict biochemical properties of molecules based on structural data</p>
          </div>
          
          <div className={styles.useCase}>
            <div className={styles.useCaseIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <h3>Reaction Outcome Analysis</h3>
            <p>Analyze potential outcomes of biochemical reactions</p>
          </div>
          
          <div className={styles.useCase}>
            <div className={styles.useCaseIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </div>
            <h3>Trend Identification</h3>
            <p>Identify patterns and trends in complex biochemical datasets</p>
          </div>
          
          <div className={styles.useCase}>
            <div className={styles.useCaseIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <h3>Target Compound Discovery</h3>
            <p>Identify promising compounds for further research and development</p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        
        <div className={styles.faqContainer}>
          {[
            {
              question: "How long does data processing take?",
              answer: "Processing time depends on the volume and complexity of your data. Most projects complete within 24 hours, while larger datasets may take between 48-72 hours. Our system notifies you when your results are ready."
            },
            {
              question: "What file formats are supported?",
              answer: "We support CSV, Excel (XLSX, XLS), JSON, TSV, SDF, mol2, PDB, SMILES, and other standard biochemical data formats. If you have a specific format requirement, please contact our support team."
            },
            {
              question: "How accurate are the predictions?",
              answer: "Our models achieve 85-95% accuracy depending on the type of biochemical data and prediction task. Each report includes confidence scores and statistical validation metrics to help you assess reliability."
            },
            {
              question: "How secure is my data?",
              answer: "All data is encrypted during transfer and storage using AES-256 encryption. We employ industry-standard security protocols, regular security audits, and strict access controls to ensure your information remains protected."
            },
            {
              question: "Can I export the results and predictions?",
              answer: "Yes, all results and predictions can be exported in multiple formats including CSV, Excel, PDF reports, and interactive visualizations. You can also integrate results with other systems via our API."
            },
            {
              question: "Do you provide custom ML models?",
              answer: "Yes, for enterprise customers we offer custom machine learning model development tailored to your specific biochemical data and prediction needs. Contact our sales team to discuss your requirements."
            }
          ].map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${activeFaq === index ? styles.active : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className={styles.faqQuestion}>
                <h3>{faq.question}</h3>
                <span className={styles.faqToggle}>
                  {activeFaq === index ? '−' : '+'}
                </span>
              </div>
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to transform your biochemical data?</h2>
          <p>Start making accurate predictions with Prosemble today</p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryButton}>Get Started</button>
            <button className={styles.outlineButton}>Schedule Demo</button>
          </div>
        </div>
        <div className={styles.ctaGraphic}>
          <div className={styles.graphicElement}></div>
          <div className={styles.graphicElement}></div>
          <div className={styles.graphicElement}></div>
        </div>
      </section>

      {/* Support Section */}
      <section className={styles.supportSection}>
        <h2>Need Additional Help?</h2>
        <p>
          Our dedicated support team is available to help you get the most out of Prosemble
        </p>
        <div className={styles.supportOptions}>
          <a href="#" className={styles.supportOption}>
            <div className={styles.supportIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h3>Live Chat</h3>
            <p>Chat with our support team Mon-Fri, 9AM-6PM EST</p>
          </a>
          
          <a href="#" className={styles.supportOption}>
            <div className={styles.supportIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>Help Center</h3>
            <p>Browse our documentation and tutorials</p>
          </a>
          
          <a href="#" className={styles.supportOption}>
            <div className={styles.supportIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3>Email Support</h3>
            <p>Get help at support@prosemble.com</p>
          </a>
        </div>
      </section>
    </div>
  );
}