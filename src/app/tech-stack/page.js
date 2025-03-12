"use client";

import { useState, useEffect, useRef } from "react";
import { useAmplify } from "@/app/Providers";
import { useRouter } from "next/navigation";
import styles from "./techstack.module.css";
import Link from "next/link";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { captureHighResScreenshot } from "../hooks/puppy";

// Import icons
import {
  faReact,
  faAws,
  faNode,
  faJs,
  faGithub,
  faNpm,
  faDocker,
  faGitAlt,
  faYarn,
  faFontAwesomeFlag,
} from "@fortawesome/free-brands-svg-icons";
import {
  faDatabase,
  faCloud,
  faServer,
  faGlobe,
  faCode,
  faLock,
  faShieldAlt,
  faDownload,
  faArrowDown,
  faCopy,
  faWandMagicSparkles,
  faMobile,
  faUsers,
  faLayerGroup,
  faFolder,
  faFile,
  faFileCode,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Logo from "@/components/Logo";

async function take4KScreenshot(selector) {
  // Target element to capture
  const element = document.querySelector(selector);

  // Set scale for 4K resolution
  const scale = 2;

  // Create canvas with higher resolution
  const canvas = document.createElement("canvas");
  const width = element.offsetWidth * scale;
  const height = element.offsetHeight * scale;
  canvas.width = width;
  canvas.height = height;

  // Render with high quality
  const context = canvas.getContext("2d");
  context.scale(scale, scale);

  // Use html2canvas with higher scale
  const html2canvas = await import("html2canvas");
  await html2canvas.default(element, {
    canvas,
    scale: scale,
    useCORS: true,
    logging: false,
    allowTaint: true,
  });

  // Convert to high-quality image
  return canvas.toDataURL("image/png", 1.0);
}

export default function TechStackPage() {
  const { identityId, isAuthenticated, userPreferences } = useAmplify();
  const router = useRouter();
  const [isLight, setIsLight] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const techStackRef = useRef(null);

  // Set theme based on user preferences
  useEffect(() => {
    if (userPreferences && userPreferences.theme) {
      setIsLight(userPreferences.theme === "light");
    }
  }, [userPreferences]);

  // Generate PDF from the tech stack component
  const handleExportPDF = async () => {
    if (!techStackRef.current) return;

    setIsDownloading(true);

    try {
      const element = techStackRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isLight ? "#ffffff" : "#121212",
      });

      const imgData = canvas.toDataURL("image/png");

      // Create PDF of the appropriate size to fit the content
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("react-nextjs-aws-techstack.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy tech stack text to clipboard
  const handleCopyText = () => {
    if (!techStackRef.current) return;

    // Extract text content from the tech stack component
    const content = techStackRef.current.textContent;

    navigator.clipboard
      .writeText(content)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        alert("Failed to copy text. Please try again.");
      });
  };

  return (
    <div className={styles.pageContainer}>
      <button onClick={captureHighResScreenshot}>
        Download High-Res Screenshot
      </button>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Technology Stack</h1>

        <div className={styles.actionButtons}>
          <button
            className={styles.exportButton}
            onClick={handleCopyText}
            disabled={isCopied}
          >
            <FontAwesomeIcon icon={faCopy} className={styles.btnIcon} />
            {isCopied ? "Copied!" : "Copy Text"}
          </button>

          <button
            className={styles.exportButton}
            onClick={handleExportPDF}
            disabled={isDownloading}
          >
            <FontAwesomeIcon icon={faDownload} className={styles.btnIcon} />
            {isDownloading ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className={styles.techStackWrapper} id={"capture-target"}>
        <div ref={techStackRef} className={styles.techStackContainer}>
          {/* Header Section */}
          <div className={styles.techHeader}>
            <div className={styles.logoContainer}>
              <Logo showTitle={false} showTagline={false} size={"large"} />
            </div>
            <div className={styles.techTitleContainer}>
              <h1 className={styles.mainTitle}>
                Prosemble Frontend Technology Stack
              </h1>
              {/* <div className={styles.badgeContainer}>
                <span className={styles.techBadge}>React.js</span>
                <span className={styles.techBadge}>Next.js</span>
                <span className={styles.techBadge}>AWS Amplify</span>
              </div> */}
            </div>
          </div>

          {/* Architecture Flow Diagram */}
          <div className={styles.architectureSection}>
            <h2 className={styles.sectionTitle}>Frontend Architecture</h2>
            <div className={styles.architectureFlow}>
              {/* Client Layer */}
              <div className={styles.archLayer}>
                <div className={styles.archBox}>
                  <FontAwesomeIcon icon={faGlobe} className={styles.archIcon} />
                  <div className={styles.archContent}>
                    <h3>Client Browser</h3>
                  </div>
                </div>
              </div>
              {/* 
              <div className={styles.arrowDown}>
                <FontAwesomeIcon icon={faArrowDown} />
              </div> */}

              {/* CloudFront Layer */}
              {/* <div className={styles.archLayer}>
                <div className={styles.archBox}>
                  <FontAwesomeIcon icon={faCloud} className={styles.archIcon} />
                  <div className={styles.archContent}>
                    <h3>AWS CloudFront</h3>
                    <p>Global CDN/Caching</p>
                  </div>
                </div>
              </div>

              <div className={styles.arrowDown}>
                <FontAwesomeIcon icon={faArrowDown} />
              </div> */}

              {/* Amplify Layer */}
              {/* <div className={styles.archLayer}>
                <div className={styles.archBox}>
                  <FontAwesomeIcon
                    icon={faServer}
                    className={styles.archIcon}
                  />
                  <div className={styles.archContent}>
                    <h3>AWS Amplify Hosting</h3>
                    <p>CI/CD, Hosting, SSL, Domain Mgmt</p>
                  </div>
                </div>
              </div> */}

              <div className={styles.arrowDown}>
                <FontAwesomeIcon icon={faArrowDown} />
              </div>

              {/* Next.js Layer */}
              <div className={styles.archLayer}>
                <div className={styles.archBox}>
                  <FontAwesomeIcon icon={faJs} className={styles.archIcon} />
                  <div className={styles.archContent}>
                    <h3>Next.js Application</h3>
                    <div className={styles.subComponentsContainer}>
                      <div className={styles.subComponent}>
                        <span>React.js Components</span>
                      </div>
                      <div className={styles.subComponent}>
                        <span>Server-side Rendering</span>
                      </div>
                      <div className={styles.subComponent}>
                        <span>Static Generation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.arrowDown}>
                <FontAwesomeIcon icon={faArrowDown} />
              </div>

              {/* Amplify Frontend Layer */}
              <div className={styles.archLayer}>
                <div className={styles.archBox}>
                  <FontAwesomeIcon icon={faAws} className={styles.archIcon} />
                  <div className={styles.archContent}>
                    <h3>AWS Amplify Frontend Library</h3>
                  </div>
                </div>
              </div>

              <div className={styles.arrowGrid}>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
              </div>

              {/* Services Grid */}
              <div className={styles.servicesGrid}>
                <div className={styles.serviceBox}>
                  <FontAwesomeIcon
                    icon={faLock}
                    className={styles.serviceIcon}
                  />
                  <h4>Auth/Cognito</h4>
                </div>

                <div className={styles.serviceBox}>
                  <FontAwesomeIcon
                    icon={faDatabase}
                    className={styles.serviceIcon}
                  />
                  <h4>Storage/S3</h4>
                </div>

                <div className={styles.serviceBox}>
                  <FontAwesomeIcon
                    icon={faCode}
                    className={styles.serviceIcon}
                  />
                  <h4>GraphQL/API</h4>
                </div>

                <div className={styles.serviceBox}>
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className={styles.serviceIcon}
                  />
                  <h4>Analytics</h4>
                </div>
              </div>

              <div className={styles.arrowGrid}>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
                <div className={styles.arrowDown}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
              </div>

              {/* Backend Services */}
              <div className={styles.archLayer}>
                <div className={styles.archBox}>
                  <FontAwesomeIcon icon={faCloud} className={styles.archIcon} />
                  <div className={styles.archContent}>
                    <h3>AWS Backend Services</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies & Services Grid */}
          <div className={styles.infoGrid}>
            {/* Core Technologies */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faReact} className={styles.cardIcon} />
                <h2>Core Technologies</h2>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.featureSection}>
                  <h3>Frontend Frameworks</h3>
                  <ul className={styles.featureList}>
                    <li className={styles.featureItem}>
                      <strong>React.js:</strong> Component-based UI library with
                      hooks and context API
                    </li>
                    <li className={styles.featureItem}>
                      <strong>Next.js:</strong> React framework with SSR, SSG,
                      API routes, file-based routing
                    </li>
                    {/* <li className={styles.featureItem}>
                      <strong>TypeScript:</strong> Static typing for improved developer experience and code quality
                    </li> */}
                  </ul>
                </div>

                <div className={styles.featureSection}>
                  <h3>State Management</h3>
                  <ul className={styles.featureList}>
                    <li className={styles.featureItem}>
                      <strong>React Context:</strong> App-wide state management
                      with custom providers
                    </li>
                    <li className={styles.featureItem}>
                      <strong>SWR:</strong> Data fetching and caching with
                      stale-while-revalidate
                    </li>
                  </ul>
                </div>

                <div className={styles.featureSection}>
                  <h3>Styling & UI</h3>
                  <ul className={styles.featureList}>
                    <li className={styles.featureItem}>
                      <strong>CSS Modules:</strong> Scoped styling with
                      preprocessor support
                    </li>
                    <li className={styles.featureItem}>
                      <strong>FontAwesome:</strong> Comprehensive icon library
                      for visual elements
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* AWS Services */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <FontAwesomeIcon icon={faAws} className={styles.cardIcon} />
                <h2>AWS Services</h2>
              </div>

              <div className={styles.servicesContainer}>
                <div className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <FontAwesomeIcon
                      icon={faLock}
                      className={styles.serviceItemIcon}
                    />
                    <h3>AWS Cognito</h3>
                  </div>
                  <p>
                    User authentication with pools, identity management, MFA
                    capabilities
                  </p>
                </div>

                <div className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <FontAwesomeIcon
                      icon={faDatabase}
                      className={styles.serviceItemIcon}
                    />
                    <h3>AWS S3</h3>
                  </div>
                  <p>
                    Secure object storage for files with direct CRUD operations
                    through AWS Amplify
                  </p>
                </div>

                <div className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <FontAwesomeIcon
                      icon={faAws}
                      className={styles.serviceItemIcon}
                    />
                    <h3>AWS Amplify</h3>
                  </div>
                  <p>
                    Frontend library integration, hosting, CI/CD pipeline
                    management, and backend connectivity
                  </p>
                </div>

                {/* <div className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <FontAwesomeIcon icon={faCloud} className={styles.serviceItemIcon} />
                    <h3>CloudFront</h3>
                  </div>
                  <p>Global CDN for fast content delivery and edge caching</p>
                </div> */}
              </div>
            </div>
          </div>

          {/* S3 Storage Structure Section */}
          <div className={styles.s3StorageSection}>
            <h2 className={styles.sectionTitle}>S3 Storage Structure</h2>
            <div className={styles.s3StructureContainer}>
              <p className={styles.s3Description}>
                Our S3 storage is organized to ensure secure and isolated file
                storage for each user and project. Files are stored in a
                hierarchical structure that keeps user data separate and
                facilitates easy access and management.
              </p>

              <div className={styles.fileStructure}>
                <div className={styles.fileNode}>
                  <div className={styles.fileNodeContent}>
                    <FontAwesomeIcon
                      icon={faDatabase}
                      className={styles.fileIcon}
                    />
                    <span className={styles.fileLabel}>S3 Bucket</span>
                  </div>

                  <div className={styles.fileChildren}>
                    <div className={styles.fileNode}>
                      <div className={styles.fileNodeContent}>
                        <FontAwesomeIcon
                          icon={faUsers}
                          className={styles.fileIcon}
                        />
                        <span className={styles.fileLabel}>user-id-123</span>
                        <span className={styles.fileDescription}>
                          Each authenticated user's folder (named by user ID)
                        </span>
                      </div>

                      <div className={styles.fileChildren}>
                        <div className={styles.fileNode}>
                          <div className={styles.fileNodeContent}>
                            <FontAwesomeIcon
                              icon={faLayerGroup}
                              className={styles.fileIcon}
                            />
                            <span className={styles.fileLabel}>
                              project-name
                            </span>
                            <span className={styles.fileDescription}>
                              Project folder (named by user)
                            </span>
                          </div>

                          <div className={styles.fileChildren}>
                            <div className={styles.fileNode}>
                              <div className={styles.fileNodeContent}>
                                <FontAwesomeIcon
                                  icon={faFolder}
                                  className={styles.fileIcon}
                                />
                                <span className={styles.fileLabel}>data/</span>
                                <span className={styles.fileDescription}>
                                  Contains user-uploaded files
                                </span>
                              </div>

                              <div className={styles.fileChildren}>
                                <div className={styles.fileNode}>
                                  <div className={styles.fileNodeContent}>
                                    <FontAwesomeIcon
                                      icon={faFile}
                                      className={styles.fileIcon}
                                    />
                                    <span className={styles.fileLabel}>
                                      uploaded-file-1.csv
                                    </span>
                                  </div>
                                </div>
                                <div className={styles.fileNode}>
                                  <div className={styles.fileNodeContent}>
                                    <FontAwesomeIcon
                                      icon={faFile}
                                      className={styles.fileIcon}
                                    />
                                    <span className={styles.fileLabel}>
                                      uploaded-file-2.xlsx
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className={styles.fileNode}>
                              <div className={styles.fileNodeContent}>
                                <FontAwesomeIcon
                                  icon={faFileCode}
                                  className={styles.fileIcon}
                                />
                                <span className={styles.fileLabel}>
                                  project-info.json
                                </span>
                                <span className={styles.fileDescription}>
                                  Metadata for the project
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.fileNode}>
                      <div className={styles.fileNodeContent}>
                        <FontAwesomeIcon
                          icon={faUsers}
                          className={styles.fileIcon}
                        />
                        <span className={styles.fileLabel}>user-id-456</span>
                      </div>
                      <div className={styles.fileChildren}>
                        <div className={styles.fileNodeContent}>
                          <FontAwesomeIcon
                            icon={faAngleRight}
                            className={styles.fileIcon}
                          />
                          <span className={styles.fileLabelMuted}>
                            Same structure for each user...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Development Workflow */}
          <div className={styles.workflowSection}>
            <h2 className={styles.sectionTitle}>Development Workflow</h2>

            <div className={styles.workflowCards}>
              <div className={styles.workflowCard}>
                <div className={styles.workflowNumber}>1</div>
                <h3>Local Development</h3>
                <ul className={styles.workflowList}>
                  <li>Next.js development server</li>
                  <li>Amplify mock for local testing</li>
                  <li>Hot module reloading</li>
                </ul>
              </div>

              <div className={styles.workflowCard}>
                <div className={styles.workflowNumber}>2</div>
                <h3>CI/CD Pipeline</h3>
                <ul className={styles.workflowList}>
                  <li>Git code push</li>
                  <li>Amplify build process</li>
                  <li>Preview deployments</li>
                  <li>Automated testing</li>
                </ul>
              </div>

              <div className={styles.workflowCard}>
                <div className={styles.workflowNumber}>3</div>
                <h3>Deployment</h3>
                <ul className={styles.workflowList}>
                  <li>Static assets to CDN</li>
                  <li>Server components to Lambda</li>
                  <li>SSL and domain configuration</li>
                  <li>Global distribution</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className={styles.benefitsSection}>
            <h2 className={styles.sectionTitle}>Benefits of This Stack</h2>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitItem}>
                <span>Performance</span>
              </div>
              <div className={styles.benefitItem}>
                <span>Scalability</span>
              </div>
              <div className={styles.benefitItem}>
                <span>Security</span>
              </div>
              <div className={styles.benefitItem}>
                <span>Developer Experience</span>
              </div>
              <div className={styles.benefitItem}>
                <span>Cost-Effective</span>
              </div>
            </div>
          </div>

          <div className={styles.footerInfo}>
            <p>React.js + Next.js + AWS Amplify Tech Stack Documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
