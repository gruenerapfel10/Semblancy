"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAmplify } from "@/app/Providers";
import styles from "./create-project.module.css";
import ConfirmationModal from "@/components/ConfirmationModal";

// Size constants in bytes
const ONE_GB = 1024 * 1024 * 1024;

const showToast = (message, type = "success") => {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `${styles.toast} ${styles[type]}`;

  // Add content to toast
  toast.innerHTML = `
    <div class="${styles.toastContent}">
      <span>${message}</span>
      <button class="${styles.toastClose}">×</button>
    </div>
  `;

  // Add to document
  document.body.appendChild(toast);

  // Add exit animation after 3 seconds
  setTimeout(() => {
    toast.classList.add(styles.exiting);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);

  // Handle close button
  const closeBtn = toast.querySelector(`.${styles.toastClose}`);
  closeBtn.addEventListener("click", () => {
    toast.classList.add(styles.exiting);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  });
};

export default function CreateProject() {
  const router = useRouter();
  const {
    user,
    identityId,
    isAuthenticated,
    isLoading,
    uploadFile,
    signOut,
    createUserFolder,
    uploadFileResumable,
    checkResumableUpload,
    saveUploadState,
    clearUploadState,
    checkProjectUploads,
    listFiles, // Add this
  } = useAmplify();

  // Form states
  const [projectName, setProjectName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");

  // File states
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  // UI states
  const [currentStep, setCurrentStep] = useState("form"); // form, summary, uploading, success
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Project data
  const [projectMetadata, setProjectMetadata] = useState(null);

  // Staging for saving
  const [stagedFiles, setStagedFiles] = useState([]);

  // Modal states
  const [showLargeFileModal, setShowLargeFileModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const largeFilesRef = useRef([]);
  const abortControllerRef = useRef({});
  const [activeUploads, setActiveUploads] = useState([]);

  // Check auth status on load
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    setPageLoading(false);
  }, [isAuthenticated, isLoading, router]);

  // Navigation protection
  const shouldBlockNavigation = () => isUploading && !isCancelled;

  // Prevent accidental navigation when uploads are in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldBlockNavigation()) {
        e.preventDefault();
        e.returnValue =
          "Changes you made may not be saved. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading, isCancelled]);

  // Intercept navigation attempts
  useEffect(() => {
    const handleNavigation = (url) => {
      if (shouldBlockNavigation()) {
        setPendingNavigation(url);
        setShowNavigationModal(true);
        return true;
      }
      return false;
    };

    // Handle router events
    const handleRouteChangeStart = (url) => {
      if (handleNavigation(url)) {
        router.events.emit("routeChangeError");
        throw new Error("Navigation cancelled by user");
      }
    };

    // Handle link clicks
    const handleLinkClick = (e) => {
      const link = e.target.closest("a");
      if (
        link &&
        link.href &&
        !link.href.startsWith("javascript:") &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        if (handleNavigation(link.href)) {
          e.preventDefault();
        }
      }
    };

    // Handle back button clicks
    const handleButtonClick = (e) => {
      const button = e.target.closest("button");
      if (
        button &&
        (button.classList.contains(styles.backButton) ||
          button.getAttribute("data-nav") === "true")
      ) {
        if (shouldBlockNavigation()) {
          e.preventDefault();
          setPendingNavigation(
            button.getAttribute("data-nav-url") || "/dashboard"
          );
          setShowNavigationModal(true);
        }
      }
    };

    // Add listeners
    if (router.events) {
      router.events.on("routeChangeStart", handleRouteChangeStart);
    }
    document.addEventListener("click", handleLinkClick);
    document.addEventListener("click", handleButtonClick);

    return () => {
      if (router.events) {
        router.events.off("routeChangeStart", handleRouteChangeStart);
      }
      document.removeEventListener("click", handleLinkClick);
      document.removeEventListener("click", handleButtonClick);
    };
  }, [isUploading, isCancelled, router]);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  };

  // File handling functions
  const checkForLargeFiles = (selectedFiles) => {
    const largeFiles = selectedFiles.filter((file) => file.size > ONE_GB);
    if (largeFiles.length > 0) {
      largeFilesRef.current = largeFiles;
      setShowLargeFileModal(true);
      return true;
    }
    return false;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const hasLargeFiles = checkForLargeFiles(selectedFiles);
    if (!hasLargeFiles) {
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);

      // Initialize progress tracking for new files
      const initialProgress = { ...uploadProgress };
      selectedFiles.forEach((file) => {
        initialProgress[file.name] = 0;
      });
      setUploadProgress(initialProgress);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const hasLargeFiles = checkForLargeFiles(droppedFiles);

      if (!hasLargeFiles) {
        setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);

        // Initialize progress tracking for new files
        const initialProgress = { ...uploadProgress };
        droppedFiles.forEach((file) => {
          initialProgress[file.name] = 0;
        });
        setUploadProgress(initialProgress);
      }
    }
  };

  const handleLargeFileConfirm = () => {
    const largeFiles = largeFilesRef.current;
    setFiles((prevFiles) => [...prevFiles, ...largeFiles]);

    // Initialize progress tracking
    const initialProgress = { ...uploadProgress };
    largeFiles.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);
    setShowLargeFileModal(false);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );

    // Update progress tracking
    setUploadProgress((prevProgress) => {
      const newProgress = { ...prevProgress };
      const removedFileName = files[indexToRemove].name;
      delete newProgress[removedFileName];
      return newProgress;
    });
  };

  const handleClickToUpload = () => {
    fileInputRef.current.click();
  };

  // Helper functions
  const sanitizeProjectName = (name) => {
    // Replace spaces and special characters with underscores
    return name.replace(/[^a-zA-Z0-9]/g, "_");
  };

  const getFileTypeFromExtension = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();

    const mimeTypes = {
      csv: "text/csv",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      xls: "application/vnd.ms-excel",
      json: "application/json",
      txt: "text/plain",
    };

    return mimeTypes[ext] || "application/octet-stream";
  };
  // Add this function to the component (above prepareForUpload):
  const checkProjectNameExists = async (projectName) => {
    if (!identityId) return false;

    try {
      // Sanitize the name to match how it would be stored
      const safeFolderName = sanitizeProjectName(projectName);
      const projectPath = `clients/${identityId}/${safeFolderName}/`;

      // List files in this path to see if the project exists
      const files = await listFiles(projectPath);

      // If we get any results back, a project with this name already exists
      return files.length > 0;
    } catch (error) {
      console.error("Error checking if project exists:", error);
      return false; // Assume it doesn't exist if we encounter an error
    }
  };

  // Then modify the prepareForUpload function:
  const prepareForUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!projectName) {
      setError("Please provide a project name.");
      return;
    }

    if (files.length === 0) {
      setError("Please upload at least one file.");
      return;
    }

    try {
      // Check if a project with this name already exists
      const projectExists = await checkProjectNameExists(projectName);

      if (projectExists) {
        setError(
          `A project named "${projectName}" already exists. Please choose a different name.`
        );
        return;
      }

      // Continue with the existing code...
      const safeFolderName = sanitizeProjectName(projectName);

      // Create project metadata
      const metadata = {
        id: Date.now().toString(),
        name: projectName,
        company: companyName,
        description,
        createdAt: new Date().toISOString(),
        createdBy: user?.username || "unknown",
        status: "Draft",
        totalBytes: files.reduce((acc, file) => acc + file.size, 0),
        fileCount: files.length,
        files: files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type || getFileTypeFromExtension(file.name),
        })),
      };

      // Store metadata for later use
      setProjectMetadata(metadata);

      // Store the staged files with path information
      const staged = files.map((file) => ({
        file,
        path: `clients/${identityId}/${safeFolderName}/data/${file.name}`,
        size: formatFileSize(file.size),
      }));

      setStagedFiles(staged);

      // Move to project summary step
      setCurrentStep("summary");
    } catch (err) {
      console.error("Error preparing project:", err);
      setError("Failed to prepare project. Please try again.");
    }
  };

  // Also update the continueWithoutFiles function:
  const continueWithoutFiles = async () => {
    setError("");

    if (!projectName) {
      setError("Please provide a project name.");
      return;
    }

    try {
      // Check if a project with this name already exists
      const projectExists = await checkProjectNameExists(projectName);

      if (projectExists) {
        setError(
          `A project named "${projectName}" already exists. Please choose a different name.`
        );
        return;
      }

      // Continue with the existing code...
      const safeFolderName = sanitizeProjectName(projectName);

      // Create project metadata without files
      const metadata = {
        id: Date.now().toString(),
        name: projectName,
        company: companyName,
        description,
        createdAt: new Date().toISOString(),
        createdBy: user?.username || "unknown",
        status: "Draft",
        totalBytes: 0,
        fileCount: 0,
        files: [],
      };

      // Store metadata for later use
      setProjectMetadata(metadata);
      setStagedFiles([]);

      // Move to project summary step
      setCurrentStep("summary");
    } catch (err) {
      console.error("Error preparing project:", err);
      setError("Failed to prepare project. Please try again.");
    }
  };

  // Save project without files
  const saveProjectWithoutFiles = async () => {
    if (!projectMetadata) {
      setError("Missing project information. Please try again.");
      return;
    }

    try {
      // Ensure the user folder exists first
      await createUserFolder();

      // Generate sanitized project folder name
      const safeFolderName = sanitizeProjectName(projectName);

      // Create project metadata with no files
      const projectWithoutFiles = {
        ...projectMetadata,
        status: "Draft",
        fileCount: 0,
        totalBytes: 0,
        files: [],
      };

      console.log("Creating project without files...");

      // Upload project metadata file
      await uploadFile(
        new Blob([JSON.stringify(projectWithoutFiles, null, 2)], {
          type: "application/json",
        }),
        `clients/${identityId}/${safeFolderName}/project-info.json`
      );

      console.log("Project created successfully without files");

      // Move to success state
      setCurrentStep("success");
    } catch (err) {
      console.error("Error creating project without files:", err);
      setError("Failed to create project. Please try again.");
    }
  };

  // Start full upload and project creation
  // Start full upload and project creation
  const startUpload = async () => {
    if (!projectMetadata) {
      setError("Missing project information. Please try again.");
      return;
    }

    // If no files to upload, just create project without files
    if (stagedFiles.length === 0) {
      await saveProjectWithoutFiles();
      return;
    }

    setIsUploading(true);
    setIsPaused(false);
    setIsCancelled(false);
    setError("");

    try {
      // Ensure the user folder exists first
      await createUserFolder();

      // Generate sanitized project folder name
      const safeFolderName = sanitizeProjectName(projectName);

      // Create a copy of project metadata with Draft status
      const uploadMetadata = {
        ...projectMetadata,
        status: "Draft",
        resumableUpload: true, // Mark as resumable upload
        filePaths: stagedFiles.map((item) => ({
          name: item.file.name,
          path: item.path,
          size: item.file.size,
          type: item.file.type || getFileTypeFromExtension(item.file.name),
        })),
      };

      console.log("Uploading project metadata...");

      // Upload project metadata file
      await uploadFile(
        new Blob([JSON.stringify(uploadMetadata, null, 2)], {
          type: "application/json",
        }),
        `clients/${identityId}/${safeFolderName}/project-info.json`
      );

      console.log("Metadata uploaded successfully");

      // Upload files to data directory
      const totalBytes = stagedFiles.reduce(
        (acc, item) => acc + item.file.size,
        0
      );
      let uploadedBytes = 0;

      // Create a map for abort controllers
      abortControllerRef.current = {};

      // Track active uploads
      const uploadPromises = [];
      setActiveUploads(uploadPromises);

      for (const [index, item] of stagedFiles.entries()) {
        // Skip if cancelled
        if (isCancelled) {
          console.log("Upload cancelled");
          break;
        }

        // Create an AbortController for this file
        const abortController = new AbortController();
        abortControllerRef.current[item.file.name] = abortController;

        try {
          // Upload each file with resumable option
          const uploadPromise = uploadFileResumable(
            item.file,
            item.path,
            (progress) => {
              // Skip progress updates if cancelled
              if (isCancelled) return;

              // Update individual file progress
              setUploadProgress((prev) => ({
                ...prev,
                [item.file.name]: progress,
              }));

              // Calculate overall progress
              const currentFileContribution =
                (item.file.size / totalBytes) * (progress / 100);
              const previousFilesContribution = uploadedBytes / totalBytes;
              const overallPercent = Math.round(
                (previousFilesContribution + currentFileContribution) * 100
              );

              setOverallProgress(overallPercent);
            },
            abortController.signal,
            {
              isPaused,
              isCancelled,
            }
          );

          uploadPromise
            .then((result) => {
              console.log(`Completed upload for ${item.file.name}`);

              // After each file completes, add its size to uploaded bytes if not cancelled
              if (!isCancelled) {
                uploadedBytes += item.file.size;

                // Update upload state to complete if this is the last file
                if (index === stagedFiles.length - 1) {
                  saveUploadState(item.path, {
                    ...result.uploadState,
                    allComplete: true,
                  });
                }
              }
            })
            .catch((err) => {
              if (
                err.name === "AbortError" ||
                err.message?.includes("aborted")
              ) {
                console.log(`Upload of ${item.file.name} was aborted`);
              } else {
                console.error(`Error uploading ${item.file.name}:`, err);

                // Save upload state on error for resumption
                if (!isCancelled && !isPaused) {
                  setError(
                    `Error uploading ${item.file.name}. You can retry later.`
                  );
                }
              }
            });

          uploadPromises.push(uploadPromise);

          // If paused, stop processing more files
          if (isPaused) {
            console.log("Upload paused, stopping additional file processing");

            // Update project metadata to reflect pause
            const pausedMetadata = {
              ...uploadMetadata,
              pausedForLater: true,
              lastPausedAt: new Date().toISOString(),
            };

            await uploadFile(
              new Blob([JSON.stringify(pausedMetadata, null, 2)], {
                type: "application/json",
              }),
              `clients/${identityId}/${safeFolderName}/project-info.json`
            );

            break;
          }
        } catch (err) {
          console.error(`Error initiating upload for ${item.file.name}:`, err);

          if (!isCancelled) {
            setError(
              `Error initiating upload for ${item.file.name}. You can try again later.`
            );
          }
        }
      }

      if (!isCancelled && !isPaused) {
        try {
          // Wait for all uploads to complete if not cancelled or paused
          await Promise.all(uploadPromises.map((p) => p.catch((e) => e)));
          console.log("All files uploaded successfully");

          // Update metadata with completed status
          const completedMetadata = {
            ...projectMetadata,
            status: "Draft",
            resumableUpload: false,
            uploadComplete: true,
          };

          await uploadFile(
            new Blob([JSON.stringify(completedMetadata, null, 2)], {
              type: "application/json",
            }),
            `clients/${identityId}/${safeFolderName}/project-info.json`
          );

          // Move to success state
          setCurrentStep("success");
        } catch (err) {
          console.error("Error finishing upload process:", err);
          setError(
            "Some files failed to upload. You can resume uploading later from your dashboard."
          );
        }
      } else if (isPaused) {
        // If paused, go back to summary and show message
        showToast(
          "Upload paused. You can resume from your dashboard later.",
          "info"
        );
        setIsUploading(false);
        setCurrentStep("summary");
      } else {
        // If cancelled, go back to summary
        setError("Upload was cancelled");
        setCurrentStep("summary");
      }
    } catch (err) {
      console.error("Error uploading project:", err);
      setError("Failed to upload project. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Improve the cancel function to be more aggressive
  const handleCancelUpload = async () => {
    setIsCancelled(true);

    // Abort all current uploads
    Object.values(abortControllerRef.current).forEach((controller) => {
      try {
        controller.abort();
      } catch (err) {
        console.error("Error aborting upload:", err);
      }
    });

    // Clear active uploads
    setActiveUploads([]);

    // Update project metadata to reflect cancellation
    try {
      if (projectMetadata) {
        const safeFolderName = sanitizeProjectName(projectName);

        const cancelledMetadata = {
          ...projectMetadata,
          status: "Draft",
          resumableUpload: false, // Cancel resumable status
          uploadCancelled: true,
          lastCancelledAt: new Date().toISOString(),
        };

        await uploadFile(
          new Blob([JSON.stringify(cancelledMetadata, null, 2)], {
            type: "application/json",
          }),
          `clients/${identityId}/${safeFolderName}/project-info.json`
        );
      }
    } catch (err) {
      console.error("Error updating metadata after cancellation:", err);
    }

    // Forcefully reset upload state
    setIsUploading(false);
    setIsPaused(false);
    setCurrentStep("summary");
    setError("Upload cancelled");

    showToast("Upload cancelled", "info");
  };

  // Upload control functions
  // Upload control functions
  const handlePauseUpload = async () => {
    setIsPaused(true);

    try {
      // Update project metadata to reflect paused state
      if (projectMetadata) {
        const safeFolderName = sanitizeProjectName(projectName);

        const pausedMetadata = {
          ...projectMetadata,
          status: "Draft",
          resumableUpload: true,
          pausedForLater: true,
          lastPausedAt: new Date().toISOString(),
          filePaths: stagedFiles.map((item) => ({
            name: item.file.name,
            path: item.path,
            size: item.file.size,
            type: item.file.type || getFileTypeFromExtension(item.file.name),
          })),
        };

        await uploadFile(
          new Blob([JSON.stringify(pausedMetadata, null, 2)], {
            type: "application/json",
          }),
          `clients/${identityId}/${safeFolderName}/project-info.json`
        );

        showToast(
          "Upload paused. You can resume from your dashboard later.",
          "info"
        );
      }
    } catch (err) {
      console.error("Error updating metadata for pause:", err);
    }
  };

  const handleResumeUpload = async () => {
    setIsPaused(false);

    try {
      // Update project metadata to reflect resumed state
      if (projectMetadata) {
        const safeFolderName = sanitizeProjectName(projectName);

        const resumedMetadata = {
          ...projectMetadata,
          status: "Draft",
          resumableUpload: true,
          pausedForLater: false,
          lastResumedAt: new Date().toISOString(),
        };

        await uploadFile(
          new Blob([JSON.stringify(resumedMetadata, null, 2)], {
            type: "application/json",
          }),
          `clients/${identityId}/${safeFolderName}/project-info.json`
        );
      }
    } catch (err) {
      console.error("Error updating metadata for resume:", err);
    }

    showToast("Upload resumed", "success");
  };

  // Navigation functions
  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleAddAnotherProject = () => {
    // Reset form fields
    setProjectName("");
    setCompanyName("");
    setDescription("");

    // Reset file states
    setFiles([]);
    setStagedFiles([]);
    setUploadProgress({});
    setOverallProgress(0);

    // Reset upload states
    setIsUploading(false);
    setIsPaused(false);
    setIsCancelled(false);

    // Reset project data
    setProjectMetadata(null);

    // Reset error states
    setError("");

    // Reset navigation & UI states
    abortControllerRef.current = {};
    setActiveUploads([]);

    // Reset any modal states if they exist
    if (typeof setShowLargeFileModal === "function")
      setShowLargeFileModal(false);
    if (typeof setShowNavigationModal === "function")
      setShowNavigationModal(false);
    if (typeof setPendingNavigation === "function") setPendingNavigation(null);

    // Finally, return to the form step
    setCurrentStep("form");
  };

  const allowNavigation = () => {
    setIsUploading(false);

    if (pendingNavigation) {
      window.location.href = pendingNavigation;
    } else {
      // Just allow the browser's default navigation
      window.removeEventListener("beforeunload");
    }
  };

  // Show loading indicator
  if (pageLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <button
          onClick={() => router.push("/dashboard")}
          className={styles.backButton}
          data-nav="true"
          data-nav-url="/dashboard"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Projects
        </button>

        <div className={styles.formContainer}>
          {/* STEP 1: CREATE PROJECT FORM */}
          {currentStep === "form" && (
            <form
              onSubmit={prepareForUpload}
              className={styles.createProjectForm}
            >
              <h1 className={styles.formTitle}>Create new project</h1>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="project-name">Project name</label>
                <input
                  type="text"
                  id="project-name"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company-name">Company name</label>
                <input
                  type="text"
                  id="company-name"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Enter project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textArea}
                  rows="3"
                />
              </div>

              <div
                className={styles.fileDropArea}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClickToUpload}
              >
                {files.length === 0 ? (
                  <>
                    <div className={styles.fileIcon}>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="#4361ee"
                        stroke="#4361ee"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M12 18v-6"></path>
                        <path d="M9 15h6"></path>
                      </svg>
                    </div>
                    <div className={styles.uploadText}>
                      <p>
                        <span className={styles.uploadLink}>
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className={styles.fileFormat}>
                        .xlsx or .csv (max. 100GB)
                      </p>
                    </div>
                  </>
                ) : (
                  <div className={styles.fileList}>
                    {files.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="#4361ee"
                          stroke="#4361ee"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span className={styles.fileName}>{file.name}</span>
                        <span className={styles.fileSize}>
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          className={styles.fileRemoveButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          title="Remove file"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.csv"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  multiple
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={continueWithoutFiles}
                  disabled={!projectName}
                >
                  Continue without files
                </button>
                <button
                  type="submit"
                  className={styles.btnCreate}
                  disabled={!projectName || files.length === 0}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PROJECT SUMMARY */}
          {currentStep === "summary" && (
            <div className={styles.summaryWrapper}>
              <h1 className={styles.formTitle}>Project Summary</h1>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.projectSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Project Name:</span>
                  <span className={styles.summaryValue}>{projectName}</span>
                </div>
                {companyName && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Company:</span>
                    <span className={styles.summaryValue}>{companyName}</span>
                  </div>
                )}
                {description && (
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Description:</span>
                    <span className={styles.summaryValue}>{description}</span>
                  </div>
                )}
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Files:</span>
                  <span className={styles.summaryValue}>
                    {stagedFiles.length}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Total Size:</span>
                  <span className={styles.summaryValue}>
                    {formatFileSize(
                      stagedFiles.reduce(
                        (total, item) => total + item.file.size,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>

              {isUploading && (
                <div className={styles.overallProgress}>
                  <div className={styles.progressLabel}>
                    <span>Overall Progress: {overallProgress}%</span>
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <div className={styles.uploadStatusMessage}>
                    <p>
                      Please remain on this page until upload completes.
                      Navigating away will interrupt your upload.
                    </p>
                  </div>
                  {/* <div className={styles.uploadControlsContainer}>
                    {isPaused ? (
                      <button
                        className={styles.btnResume}
                        onClick={handleResumeUpload}
                      >
                        Resume Upload
                      </button>
                    ) : (
                      <button
                        className={styles.btnPause}
                        onClick={handlePauseUpload}
                      >
                        Pause Upload
                      </button>
                    )}
                    <button
                      className={styles.btnCancel}
                      onClick={handleCancelUpload}
                    >
                      Cancel Upload
                    </button>
                  </div> */}
                </div>
              )}

              <div className={styles.filesList}>
                <h3>Files to Upload</h3>
                <div className={styles.filesListContainer}>
                  {stagedFiles.length > 0 ? (
                    stagedFiles.map((item, index) => (
                      <div key={index} className={styles.stagedFileItem}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="#4361ee"
                          stroke="#4361ee"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span className={styles.stagedFileName}>
                          {item.file.name}
                        </span>
                        <span className={styles.stagedFileSize}>
                          {item.size}
                        </span>

                        {/* Show progress bar when uploading */}
                        {isUploading && (
                          <div className={styles.fileProgressBarContainer}>
                            <div
                              className={styles.fileProgressBarFill}
                              style={{
                                width: `${
                                  uploadProgress[item.file.name] || 0
                                }%`,
                              }}
                            ></div>
                            <span className={styles.fileProgressPercent}>
                              {uploadProgress[item.file.name] || 0}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={styles.noFilesMessage}>
                      No files added to this project.
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.summaryActions}>
                <button
                  className={styles.btnOutline}
                  onClick={() => setCurrentStep("form")}
                  disabled={isUploading}
                >
                  Back
                </button>
                <div className={styles.rightActions}>
                  <button
                    className={styles.btnSecondary}
                    onClick={saveProjectWithoutFiles}
                    disabled={isUploading}
                  >
                    Save & upload later
                  </button>
                  <button
                    className={styles.btnApprove}
                    onClick={startUpload}
                    disabled={isUploading}
                  >
                    Upload and create project
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {currentStep === "success" && (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00BFA6"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 className={styles.successTitle}>
                Your project has been created!
              </h2>
              <p className={styles.successMessage}>
                We'll notify you via email when the processing is complete.
              </p>
              <div className={styles.successActions}>
                <button
                  className={styles.btnOutline}
                  onClick={handleAddAnotherProject}
                >
                  Add another project
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleGoToDashboard}
                >
                  Go to dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Large File Warning Modal */}
      <ConfirmationModal
        isOpen={showLargeFileModal}
        onClose={() => {
          setShowLargeFileModal(false);
          largeFilesRef.current = [];
        }}
        onConfirm={handleLargeFileConfirm}
        title="Large File(s) Detected"
        message={`You're uploading ${largeFilesRef.current.length} file(s) larger than 1GB. Large files may take a significant amount of time to upload. Are you sure you want to proceed?`}
        confirmText="Yes, Upload Large Files"
        cancelText="Cancel"
        type="warning"
      />

      {/* Navigation Warning Modal */}
      <ConfirmationModal
        isOpen={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        onConfirm={allowNavigation}
        title="Upload in Progress"
        message="You have an upload in progress. If you leave this page, the upload will be cancelled and your progress will be lost. Are you sure you want to leave?"
        confirmText="Leave Page"
        cancelText="Stay on Page"
        type="danger"
      />
    </div>
  );
}
