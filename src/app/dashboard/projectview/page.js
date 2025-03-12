"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAmplify } from "@/app/Providers";
import styles from "./projectview.module.css";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faTrash,
  faFileAlt,
  faPlus,
  faCheckCircle,
  faDownload,
  faEdit,
  faUser,
  faCalendarAlt,
  faBuilding,
  faFileUpload,
  faFileCsv,
  faFileExcel,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function ProjectView() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project-id");
  const [project, setProject] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState("files");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  // Upload progress tracking
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const abortControllerRef = useRef({});

  // Define allowed file extensions
  const allowedExtensions = [
    ".csv",
    ".xlsx",
    ".xls",
    ".json",
    ".txt",
    ".tsv",
    ".parquet",
    ".avro",
    ".feather",
    ".pickle",
    ".h5",
    ".hdf5",
    ".npz",
  ];

  // Accepted mime types for the file input
  const acceptedFileTypes =
    ".csv,.xlsx,.xls,.json,.txt,.tsv,.parquet,.avro,.feather,.pickle,.h5,.hdf5,.npz";

  const {
    identityId,
    isAuthenticated,
    listFiles,
    getFileUrl,
    deleteFile,
    uploadFile,
  } = useAmplify();
  const router = useRouter();

  // Load project data
  useEffect(() => {
    if (isAuthenticated && identityId && projectId) {
      loadProjectData();
    }
  }, [isAuthenticated, identityId, projectId]);

  // Function to validate file extensions
  const validateFileType = (file) => {
    const extension = "." + file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(extension);
  };

  const loadProjectData = async () => {
    try {
      setIsLoading(true);

      // Root path for user's projects
      const userProjectsPath = `clients/${identityId}/`;
      console.log(`Looking for project with ID: ${projectId}`);

      // Get all project info files
      const allUserFiles = await listFiles(userProjectsPath);
      const projectInfoFiles = allUserFiles.filter((file) =>
        file.path.includes("/project-info.json")
      );

      // Find the project that matches the projectId
      let foundProject = null;
      let projectName = null;

      for (const infoFile of projectInfoFiles) {
        try {
          // Get the file URL
          const fileUrl = await getFileUrl(infoFile.path);

          // Fetch the project info JSON
          const response = await fetch(fileUrl);
          if (!response.ok) {
            console.error(`Failed to fetch project info: ${response.status}`);
            continue;
          }

          const projectInfo = await response.json();

          // Check if this is the project we're looking for
          if (projectInfo.id === projectId) {
            // Extract project name from path
            const pathParts = infoFile.path.split("/");
            projectName = pathParts[2];

            // Find data files for this project
            const dataFiles = allUserFiles.filter((file) =>
              file.path.includes(`/${projectName}/data/`)
            );

            // Create project object
            foundProject = {
              id: projectInfo.id,
              name: projectInfo.name || projectName,
              company: projectInfo.company || "",
              description:
                projectInfo.description || "No description provided.",
              status: projectInfo.status || "Draft",
              date: new Date(projectInfo.createdAt).toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              ),
              results: projectInfo.results || "#Pending",
              files: dataFiles.length,
              size: projectInfo.totalBytes
                ? formatFileSize(projectInfo.totalBytes)
                : formatFileSize(
                    dataFiles.reduce((total, file) => total + file.size, 0)
                  ),
              folderPath: `${identityId}/${projectName}`,
              createdBy: projectInfo.createdBy || "Unknown",
              createdAt: projectInfo.createdAt,
              lastUpdated: projectInfo.lastUpdated || projectInfo.createdAt,
            };

            break;
          }
        } catch (error) {
          console.error(
            `Error processing project info: ${infoFile.path}`,
            error
          );
        }
      }

      if (foundProject) {
        setProject(foundProject);
        loadProjectFiles(foundProject);
      } else {
        console.error(`Project with ID ${projectId} not found`);
        alert("Project not found. Redirecting to dashboard.");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error loading project data:", error);
      alert("Failed to load project data. Redirecting to dashboard.");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectFiles = async (project) => {
    setIsLoadingFiles(true);

    try {
      if (!project || !project.folderPath) return;

      // List all files in the project folder
      const projectPath = `clients/${project.folderPath}/data/`;
      const projectDataFiles = await listFiles(projectPath);

      // Filter out .uploadstate files
      const filteredFiles = projectDataFiles.filter(
        (file) => !file.path.endsWith(".uploadstate")
      );

      // Get file URLs and additional info
      const filesWithUrls = await Promise.all(
        filteredFiles.map(async (file) => {
          const url = await getFileUrl(file.path);
          const fileName = file.path.split("/").pop();
          const extension = fileName.split(".").pop().toLowerCase();

          // Determine icon based on file extension
          let icon = faFileAlt;
          if (extension === "csv") {
            icon = faFileCsv;
          } else if (["xlsx", "xls"].includes(extension)) {
            icon = faFileExcel;
          }

          return {
            ...file,
            url,
            name: fileName,
            size: formatFileSize(file.size),
            extension,
            icon,
            uploadDate: new Date(
              file.lastModified || Date.now()
            ).toLocaleDateString("en-GB"),
          };
        })
      );

      setProjectFiles(filesWithUrls);
    } catch (error) {
      console.error("Error loading project files:", error);
      setProjectFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Format file sizes
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Handle file upload to project with filtering and progress
  const handleFileUpload = async (e) => {
    if (!project) return;
    setFileError("");

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter valid files
    const validFiles = files.filter(validateFileType);
    const invalidFiles = files.filter((file) => !validateFileType(file));

    // Display error message if any invalid files
    if (invalidFiles.length > 0) {
      const errorMsg = `${
        invalidFiles.length
      } file(s) were not accepted: ${invalidFiles
        .map((f) => f.name)
        .join(", ")}`;
      setFileError(errorMsg);

      if (validFiles.length === 0) return; // Exit if no valid files
    }

    try {
      // Setup upload tracking
      const filesToUpload = validFiles.map((file) => ({
        file,
        id: `upload_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)}`,
        name: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        progress: 0,
        status: "uploading",
        extension: file.name.split(".").pop().toLowerCase(),
        icon: getFileIcon(file.name.split(".").pop().toLowerCase()),
      }));

      // Add the files to the uploading files state to show in the UI
      setUploadingFiles((prev) => [...prev, ...filesToUpload]);

      // Initialize progress tracking
      const progressObj = {};
      filesToUpload.forEach((file) => {
        progressObj[file.id] = 0;
      });
      setUploadProgress((prev) => ({ ...prev, ...progressObj }));

      // Get project path
      const projectPath = `clients/${project.folderPath}/data/`;

      // Upload each file with progress tracking
      for (const fileItem of filesToUpload) {
        // Create an AbortController for this file
        const abortController = new AbortController();
        abortControllerRef.current[fileItem.id] = abortController;

        try {
          await uploadFile(
            fileItem.file,
            `${projectPath}${fileItem.name}`,
            // Progress callback
            (progress) => {
              setUploadProgress((prev) => ({
                ...prev,
                [fileItem.id]: progress,
              }));

              // Update status in uploading files array
              setUploadingFiles((prev) =>
                prev.map((item) =>
                  item.id === fileItem.id
                    ? {
                        ...item,
                        progress,
                        status: progress === 100 ? "complete" : "uploading",
                      }
                    : item
                )
              );
            },
            abortController.signal
          );

          // Mark as complete when done
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.id === fileItem.id
                ? { ...item, progress: 100, status: "complete" }
                : item
            )
          );
        } catch (error) {
          console.error(`Error uploading file ${fileItem.name}:`, error);

          // Mark as failed
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.id === fileItem.id ? { ...item, status: "failed" } : item
            )
          );

          // Continue with other files
          continue;
        }
      }

      // Update project info after all uploads
      const projectInfoPath = `clients/${project.folderPath}/project-info.json`;
      const fileUrl = await getFileUrl(projectInfoPath);
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch project info: ${response.status}`);
      }

      const projectInfo = await response.json();

      // Update file count and size
      const projectDataFiles = await listFiles(projectPath);
      const totalBytes = projectDataFiles.reduce(
        (total, file) => total + file.size,
        0
      );

      projectInfo.totalBytes = totalBytes;
      projectInfo.fileCount = projectDataFiles.length;
      projectInfo.lastUpdated = new Date().toISOString();

      // Upload updated project info
      await uploadFile(
        new Blob([JSON.stringify(projectInfo, null, 2)], {
          type: "application/json",
        }),
        projectInfoPath
      );

      // Update local state
      setProject((prev) => ({
        ...prev,
        files: projectDataFiles.length,
        size: formatFileSize(totalBytes),
        lastUpdated: projectInfo.lastUpdated,
      }));

      // Reload project files after a short delay to show the new files
      setTimeout(() => {
        loadProjectFiles(project);

        // Remove completed uploads from the UI after a delay
        setTimeout(() => {
          setUploadingFiles((prev) =>
            prev.filter((item) => item.status !== "complete")
          );
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload some files. Please try again.");
    }
  };

  // Get icon based on file extension
  const getFileIcon = (extension) => {
    if (extension === "csv") {
      return faFileCsv;
    } else if (["xlsx", "xls"].includes(extension)) {
      return faFileExcel;
    }
    return faFileAlt;
  };

  // Cancel a specific file upload
  const cancelFileUpload = (fileId) => {
    if (abortControllerRef.current[fileId]) {
      // Abort the upload
      abortControllerRef.current[fileId].abort();

      // Update status in UI
      setUploadingFiles((prev) =>
        prev.map((item) =>
          item.id === fileId ? { ...item, status: "cancelled" } : item
        )
      );

      // Remove from list after delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((item) => item.id !== fileId));
      }, 2000);
    }
  };

  // Delete a single file from the project
  const handleDeleteFile = async (filePath) => {
    if (!project) return;

    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      setIsLoadingFiles(true);

      // Delete the file
      await deleteFile(filePath);

      // Update project info
      const projectInfoPath = `clients/${project.folderPath}/project-info.json`;
      const fileUrl = await getFileUrl(projectInfoPath);
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch project info: ${response.status}`);
      }

      const projectInfo = await response.json();

      // Update file count and size
      const projectPath = `clients/${project.folderPath}/data/`;
      const projectDataFiles = await listFiles(projectPath);
      const totalBytes = projectDataFiles.reduce(
        (total, file) => total + file.size,
        0
      );

      projectInfo.totalBytes = totalBytes;
      projectInfo.fileCount = projectDataFiles.length;
      projectInfo.lastUpdated = new Date().toISOString();

      // Upload updated project info
      await uploadFile(
        new Blob([JSON.stringify(projectInfo, null, 2)], {
          type: "application/json",
        }),
        projectInfoPath
      );

      // Update local state
      setProject((prev) => ({
        ...prev,
        files: projectDataFiles.length,
        size: formatFileSize(totalBytes),
        lastUpdated: projectInfo.lastUpdated,
      }));

      // Remove the deleted file from the list
      setProjectFiles((prevFiles) =>
        prevFiles.filter((file) => file.path !== filePath)
      );

      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!project) return;
    if (confirmText !== project.name) {
      alert("Project name does not match. Deletion cancelled.");
      return;
    }

    try {
      setIsDeleting(true);

      // Delete the project files from S3
      console.log(`Deleting project files for ${project.name} from S3`);

      // List all files in the project folder
      const projectPath = `clients/${project.folderPath}/`;
      console.log(`Listing files in: ${projectPath}`);
      const projectFiles = await listFiles(projectPath);

      // Delete each file including the project metadata
      for (const file of projectFiles) {
        if (file.path.endsWith("/")) {
          // This is a folder, need to list and delete its contents first
          const subFiles = await listFiles(file.path);
          for (const subFile of subFiles) {
            await deleteFile(subFile.path);
            console.log(`Deleted file: ${subFile.path}`);
          }
        }

        // Now delete the file/folder itself
        await deleteFile(file.path);
        console.log(`Deleted: ${file.path}`);
      }

      // Close modal and redirect to dashboard
      setDeleteModalOpen(false);
      router.push("/dashboard");

      console.log(`Project ${project.name} deleted successfully`);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle project approval
  const handleApproveProject = async () => {
    if (!project) return;

    try {
      setIsApproving(true);

      // Update project status in S3
      const projectInfoPath = `clients/${project.folderPath}/project-info.json`;

      // Get current project info
      const fileUrl = await getFileUrl(projectInfoPath);
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch project info: ${response.status}`);
      }

      const projectInfo = await response.json();

      // Update status
      projectInfo.status = "Pending";
      projectInfo.lastUpdated = new Date().toISOString();

      // Upload updated project info
      await uploadFile(
        new Blob([JSON.stringify(projectInfo, null, 2)], {
          type: "application/json",
        }),
        projectInfoPath
      );

      // Update local state
      setProject((prev) => ({
        ...prev,
        status: "Pending",
        lastUpdated: projectInfo.lastUpdated,
      }));

      // Close modal
      setApproveModalOpen(false);

      alert("Project has been approved and sent for processing!");
    } catch (error) {
      console.error("Error approving project:", error);
      alert("Failed to approve project. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <LoadingSpinner fullPage={true} text="Loading project details..." />;
  }

  // Get appropriate status class and display for uploading files
  const getStatusDisplay = (status) => {
    switch (status) {
      case "uploading":
        return { className: styles.statusUploading, text: "Uploading" };
      case "complete":
        return { className: styles.statusComplete, text: "Complete" };
      case "failed":
        return { className: styles.statusFailed, text: "Failed" };
      case "cancelled":
        return { className: styles.statusCancelled, text: "Cancelled" };
      default:
        return { className: "", text: status };
    }
  };

  return (
    <div className={styles.projectViewContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <button
          onClick={() => router.push("/dashboard")}
          className={styles.backButton}
        >
          <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} />
          Back to Dashboard
        </button>

        <div className={styles.projectActions}>
          {project?.status === "Draft" && (
            <button
              className={styles.approveButton}
              onClick={() => setApproveModalOpen(true)}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              Approve Project
            </button>
          )}
          <button
            className={styles.deleteButton}
            onClick={() => setDeleteModalOpen(true)}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete Project
          </button>
        </div>
      </div>

      {/* Project Overview */}
      <div className={styles.projectOverview}>
        <div className={styles.projectHeader}>
          <h1 className={styles.projectTitle}>{project?.name}</h1>
          <span
            className={`${styles.statusBadge} ${
              styles[project?.status?.toLowerCase().replace(/\s+/g, "")]
            }`}
          >
            {project?.status}
          </span>
        </div>

        <div className={styles.projectMetadata}>
          <div className={styles.metadataItem}>
            <FontAwesomeIcon
              icon={faBuilding}
              className={styles.metadataIcon}
            />
            <span className={styles.metadataLabel}>Company:</span>
            <span className={styles.metadataValue}>
              {project?.company || "Not specified"}
            </span>
          </div>

          <div className={styles.metadataItem}>
            <FontAwesomeIcon icon={faUser} className={styles.metadataIcon} />
            <span className={styles.metadataLabel}>Created by:</span>
            <span className={styles.metadataValue}>{project?.createdBy}</span>
          </div>

          <div className={styles.metadataItem}>
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className={styles.metadataIcon}
            />
            <span className={styles.metadataLabel}>Created on:</span>
            <span className={styles.metadataValue}>
              {formatDate(project?.createdAt)}
            </span>
          </div>

          <div className={styles.metadataItem}>
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className={styles.metadataIcon}
            />
            <span className={styles.metadataLabel}>Last updated:</span>
            <span className={styles.metadataValue}>
              {formatDate(project?.lastUpdated)}
            </span>
          </div>
        </div>

        {project?.description && (
          <div className={styles.projectDescription}>
            <h3>Description</h3>
            <p>{project.description}</p>
          </div>
        )}

        <div className={styles.projectStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{project?.files}</span>
            <span className={styles.statLabel}>Files</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>{project?.size}</span>
            <span className={styles.statLabel}>Total Size</span>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className={styles.contentTabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "files" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("files")}
        >
          Files
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "results" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("results")}
        >
          Results
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "files" && (
          <div className={styles.filesTab}>
            <div className={styles.filesHeader}>
              <h2>Project Files</h2>

              <div className={styles.fileUploadControls}>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className={styles.hiddenFileInput}
                  accept={acceptedFileTypes}
                />
                <button
                  className={styles.uploadButton}
                  onClick={() => fileInputRef.current.click()}
                  disabled={project?.status !== "Draft"}
                >
                  <FontAwesomeIcon icon={faFileUpload} />
                  Upload Files
                </button>

                <div className={styles.fileFormatInfo}>
                  Accepted formats: CSV, Excel, JSON, and other data formats
                </div>
              </div>
            </div>

            {fileError && (
              <div className={styles.fileErrorMessage}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{fileError}</span>
              </div>
            )}

            {isLoadingFiles ? (
              <div className={styles.loadingFiles}>
                <div className={styles.spinner}></div>
                <p>Loading files...</p>
              </div>
            ) : (
              <>
                <div className={styles.filesTable}>
                  <div className={styles.tableHeader}>
                    <div className={styles.fileCell}>File Name</div>
                    <div className={styles.fileTypeCell}>Type</div>
                    <div className={styles.fileSizeCell}>Size</div>
                    <div className={styles.fileDateCell}>Status</div>
                    <div className={styles.fileActionsCell}>Actions</div>
                  </div>

                  {/* Uploading files with progress */}
                  {uploadingFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`${styles.fileRow} ${styles.uploadingFileRow}`}
                    >
                      <div className={styles.fileCell}>
                        <FontAwesomeIcon
                          icon={file.icon}
                          className={styles.fileIcon}
                          spin={file.status === "uploading"}
                        />
                        <span className={styles.fileName}>{file.name}</span>
                      </div>
                      <div className={styles.fileTypeCell}>
                        {file.extension.toUpperCase()}
                      </div>
                      <div className={styles.fileSizeCell}>
                        {file.formattedSize}
                      </div>
                      <div className={styles.fileDateCell}>
                        <div className={styles.uploadStatusContainer}>
                          <div
                            className={`${styles.uploadStatus} ${
                              getStatusDisplay(file.status).className
                            }`}
                          >
                            {getStatusDisplay(file.status).text}
                          </div>
                          {file.status === "uploading" && (
                            <div className={styles.progressContainer}>
                              <div
                                className={styles.progressBar}
                                style={{
                                  width: `${uploadProgress[file.id] || 0}%`,
                                }}
                              ></div>
                              <span className={styles.progressText}>
                                {uploadProgress[file.id] || 0}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.fileActionsCell}>
                        {file.status === "uploading" && (
                          <button
                            className={`${styles.fileActionButton} ${styles.cancelActionButton}`}
                            onClick={() => cancelFileUpload(file.id)}
                            title="Cancel upload"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Regular files */}
                  {projectFiles.length > 0 ? (
                    projectFiles.map((file, index) => (
                      <div key={index} className={styles.fileRow}>
                        <div className={styles.fileCell}>
                          <FontAwesomeIcon
                            icon={file.icon}
                            className={styles.fileIcon}
                          />
                          <span className={styles.fileName}>{file.name}</span>
                        </div>
                        <div className={styles.fileTypeCell}>
                          {file.extension.toUpperCase()}
                        </div>
                        <div className={styles.fileSizeCell}>{file.size}</div>
                        <div className={styles.fileDateCell}>
                          {file.uploadDate}
                        </div>
                        <div className={styles.fileActionsCell}>
                          <a
                            href={file.url}
                            download={file.name}
                            className={styles.fileActionButton}
                            title="Download file"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </a>
                          {project?.status === "Draft" && (
                            <button
                              className={`${styles.fileActionButton} ${styles.deleteActionButton}`}
                              onClick={() => handleDeleteFile(file.path)}
                              title="Delete file"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : uploadingFiles.length === 0 ? (
                    <div className={styles.noFiles}>
                      <p>No files have been uploaded to this project yet.</p>
                      {project?.status === "Draft" && (
                        <div>
                          <button
                            className={styles.uploadButtonLarge}
                            onClick={() => fileInputRef.current.click()}
                          >
                            <FontAwesomeIcon icon={faFileUpload} />
                            Upload Files
                          </button>
                          <p className={styles.acceptedFormatsNote}>
                            Accepted formats: CSV, Excel, JSON, and other
                            machine learning data formats
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div className={styles.resultsTab}>
            {project?.status === "Completed" ? (
              <div className={styles.resultsContent}>
                <h2>Project Results</h2>
                {/* Results content would go here */}
                <p>Results for this project are available.</p>
              </div>
            ) : (
              <div className={styles.noResults}>
                <div className={styles.processingIcon}>
                  {project?.status === "Pending" ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className={styles.noResultsIcon}
                    />
                  )}
                </div>
                <h3>
                  {project?.status === "Pending"
                    ? "Project is being processed"
                    : "Results not available"}
                </h3>
                <p>
                  {project?.status === "Pending"
                    ? "Your project is currently being processed by our data engineers. Results will be available once processing is complete."
                    : "This project has not been approved for processing yet. Please approve the project to begDrafting."}
                </p>
                {project?.status === "Draft" && (
                  <button
                    className={styles.approveButtonLarge}
                    onClick={() => setApproveModalOpen(true)}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Approve Project
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Project Modal */}
      {deleteModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isDeleting && setDeleteModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Project</h2>
              {!isDeleting && (
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setDeleteModalOpen(false)}
                >
                  &times;
                </button>
              )}
            </div>
            <div className={styles.modalContent}>
              <div className={styles.warningIcon}>
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <p className={styles.modalMessage}>
                Are you sure you want to delete <strong>{project?.name}</strong>
                ? This action cannot be undone.
              </p>
              <p className={styles.confirmInstructions}>
                Type <strong>{project?.name}</strong> below to confirm:
              </p>
              <input
                type="text"
                className={styles.confirmInput}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type project name to confirm"
                disabled={isDeleting}
              />
            </div>
            <div className={styles.modalActions}>
              {!isDeleting && (
                <button
                  className={styles.cancelButton}
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              )}
              <button
                className={styles.confirmDeleteButton}
                onClick={handleDeleteProject}
                disabled={confirmText !== project?.name || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className={styles.spinnerSmall}></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Project"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Project Modal */}
      {approveModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isApproving && setApproveModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Approve Project</h2>
              {!isApproving && (
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setApproveModalOpen(false)}
                >
                  &times;
                </button>
              )}
            </div>
            <div className={styles.modalContent}>
              <div className={styles.approveIcon}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <p className={styles.modalMessage}>
                You're about to approve <strong>{project?.name}</strong> for
                processing.
              </p>
              <p className={styles.approveInstructions}>
                Once approved, your files will be sent to our data engineers for
                review. The project status will change to "Pending" until
                processing begins.
              </p>
            </div>
            <div className={styles.modalActions}>
              {!isApproving && (
                <button
                  className={styles.cancelButton}
                  onClick={() => setApproveModalOpen(false)}
                >
                  Cancel
                </button>
              )}
              <button
                className={styles.confirmApproveButton}
                onClick={handleApproveProject}
                disabled={isApproving}
              >
                {isApproving ? (
                  <>
                    <div className={styles.spinnerSmall}></div>
                    Approving...
                  </>
                ) : (
                  "Approve Project"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
