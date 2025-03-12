"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./projects.module.css";
import { useAmplify } from "@/app/Providers";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faPlus,
  faChevronDown,
  faChevronUp,
  faTrash,
  faEye,
  faCheckCircle,
  faFileAlt,
  faSearch,
  faSortDown,
  faSortUp,
  faSquare,
  faCheckSquare,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

import React from "react";
import { extractFullName } from "@/utils";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  // Search and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = newest first

  // Multi-select states
  const [selectedProjects, setSelectedProjects] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkApproveModalOpen, setBulkApproveModalOpen] = useState(false);

  const {
    identityId,
    isAuthenticated,
    listFiles,
    getFileUrl,
    deleteFile,
    uploadFile,
    user
  } = useAmplify();

  const router = useRouter();

  // Load projects when component mounts
  useEffect(() => {
    if (isAuthenticated && identityId) {
      loadUserProjects();
    }
  }, [isAuthenticated, identityId]);

  // Clear any open modals when navigating away
  useEffect(() => {
    return () => {
      setDeleteModalOpen(false);
      setApproveModalOpen(false);
      setBulkDeleteModalOpen(false);
      setBulkApproveModalOpen(false);
    };
  }, []);

  // Update bulk actions visibility based on selections
  useEffect(() => {
    const hasSelections = Object.values(selectedProjects).some(
      (selected) => selected
    );
    setShowBulkActions(hasSelections);
  }, [selectedProjects]);

  // Helper to show toast messages
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

  // Format date with time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Load projects directly from S3 storage
  const loadUserProjects = async () => {
    try {
      setIsPageLoading(true);
      const userProjectsPath = `clients/${identityId}/`;
      const allUserFiles = await listFiles(userProjectsPath);
      const projectInfoFiles = allUserFiles.filter((file) =>
        file.path.includes("/project-info.json")
      );

      const projectsList = [];

      // Process each project
      for (const infoFile of projectInfoFiles) {
        try {
          const pathParts = infoFile.path.split("/");
          const projectName = pathParts[2];
          const fileUrl = await getFileUrl(infoFile.path);
          const response = await fetch(fileUrl);

          if (!response.ok) continue;

          const projectInfo = await response.json();

          // Filter out uploadstate files when counting data files
          const dataFiles = allUserFiles.filter((file) => {
            const filePath = file.path || file.key || "";
            return (
              filePath.includes(`/${projectName}/data/`) &&
              !filePath.endsWith(".uploadstate")
            );
          });

          // Add to projects list
          projectsList.push({
            id: projectInfo.id || Date.now().toString(),
            name: projectInfo.name || projectName,
            company: projectInfo.company || "",
            description: projectInfo.description || "No description provided",
            status: projectInfo.status || "Draft",
            createdAt: projectInfo.createdAt,
            date: new Date(projectInfo.createdAt).toLocaleDateString(),
            files: dataFiles.length,
            size: formatFileSize(
              projectInfo.totalBytes ||
                dataFiles.reduce((total, file) => total + file.size, 0)
            ),
            folderPath: `${identityId}/${projectName}`,
          });
        } catch (error) {
          console.error(
            `Error processing project info: ${infoFile.path}`,
            error
          );
        }
      }

      setProjects(projectsList);
      // Reset selections when projects change
      setSelectedProjects({});
      setSelectAll(false);
    } catch (error) {
      console.error("Error loading user projects:", error);
      setProjects([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Format file sizes in human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      if (!searchTerm) return true;

      // Search in name, company, and description
      const searchLower = searchTerm.toLowerCase();
      return (
        project.name.toLowerCase().includes(searchLower) ||
        project.company.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by date (newest or oldest first based on sortOrder)
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);

      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Render the appropriate action button for a project based on its status
  const renderProjectActions = (project) => {
    // For Draft projects with files
    if (project.status === "Draft" && project.files > 0) {
      return (
        <button
          className={styles.approveButton}
          onClick={(e) => {
            e.stopPropagation();
            openApproveModal(project);
          }}
        >
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>Approve</span>
        </button>
      );
    }

    // For Draft projects with no files
    if (project.status === "Draft" && project.files === 0) {
      return (
        <button
          className={styles.addFilesButton}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/projectview?project-id=${project.id}`);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Files
        </button>
      );
    }

    // For Pending projects, show a status indicator
    else if (project.status === "Pending") {
      return <span className={styles.pendingStatus}></span>;
    }

    // For Completed projects, show "View Results" button
    else if (project.status === "Completed") {
      return (
        <button
          className={styles.viewButton}
          onClick={(e) => {
            e.stopPropagation();
            handleViewResults(project.id);
          }}
        >
          View Results
        </button>
      );
    }

    // Fallback for any other status
    return null;
  };

  // Handle project deletion - delete from S3
  const handleDeleteProject = async () => {
    if (!activeProject) return;
    if (confirmText !== activeProject.name) {
      alert("Project name does not match. Deletion cancelled.");
      return;
    }

    try {
      setIsDeleting(true);

      // Delete the project files from S3
      console.log(`Deleting project files for ${activeProject.name} from S3`);

      // List all files in the project folder
      const projectPath = `clients/${activeProject.folderPath}/`;
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

      // Update the state by removing the deleted project
      setProjects((prevProjects) =>
        prevProjects.filter((p) => p.id !== activeProject.id)
      );

      // Clear selection if it was selected
      setSelectedProjects((prev) => {
        const updated = { ...prev };
        delete updated[activeProject.id];
        return updated;
      });

      // Close modal and reset state
      setDeleteModalOpen(false);
      setActiveProject(null);
      setConfirmText("");
      setMenuOpenIndex(null);

      showToast(
        `Project ${activeProject.name} deleted successfully`,
        "success"
      );
      console.log(`Project ${activeProject.name} deleted successfully`);
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast("Failed to delete project. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle project approval without uploading (non-staged files)
  const handleApproveProject = async () => {
    if (!activeProject) return;

    try {
      setIsApproving(true);

      // Get project paths
      const projectPath = `clients/${activeProject.folderPath}`;
      const projectInfoPath = `${projectPath}/project-info.json`;

      // Get current project metadata
      const fileUrl = await getFileUrl(projectInfoPath);
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch project info: ${response.status}`);
      }

      const projectInfo = await response.json();

      // Update project info to Pending
      projectInfo.status = "Pending";

      // Upload updated project info
      await uploadFile(
        new Blob([JSON.stringify(projectInfo, null, 2)], {
          type: "application/json",
        }),
        projectInfoPath
      );

      // Update UI state
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === activeProject.id ? { ...p, status: "Pending" } : p
        )
      );

      setApproveModalOpen(false);
      setActiveProject(null);
      setMenuOpenIndex(null);

      // Show success message
      showToast("Project approved and being processed!", "success");
    } catch (error) {
      console.error("Error approving project:", error);
      showToast("Failed to approve project. Please try again.", "error");
    } finally {
      setIsApproving(false);
    }
  };

  // Bulk approve projects
  const handleBulkApprove = async () => {
    try {
      setIsApproving(true);
      let approvedCount = 0;
      const errorProjects = [];

      // Get selected projects that are in Draft status
      const selectedIds = Object.keys(selectedProjects).filter(
        (id) =>
          selectedProjects[id] &&
          projects.find((p) => p.id === id)?.status === "Draft" &&
          projects.find((p) => p.id === id)?.files > 0
      );

      for (const projectId of selectedIds) {
        try {
          const project = projects.find((p) => p.id === projectId);
          const projectPath = `clients/${project.folderPath}`;
          const projectInfoPath = `${projectPath}/project-info.json`;

          // Get current project metadata
          const fileUrl = await getFileUrl(projectInfoPath);
          const response = await fetch(fileUrl);

          if (!response.ok) {
            errorProjects.push(project.name);
            continue;
          }

          const projectInfo = await response.json();

          // Update project info to Pending
          projectInfo.status = "Pending";

          // Upload updated project info
          await uploadFile(
            new Blob([JSON.stringify(projectInfo, null, 2)], {
              type: "application/json",
            }),
            projectInfoPath
          );

          approvedCount++;
        } catch (error) {
          console.error(`Error approving project ${projectId}:`, error);
          const projectName =
            projects.find((p) => p.id === projectId)?.name || projectId;
          errorProjects.push(projectName);
        }
      }

      // Update UI state
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          selectedProjects[p.id] ? { ...p, status: "Pending" } : p
        )
      );

      // Clear selections
      setSelectedProjects({});
      setSelectAll(false);
      setBulkApproveModalOpen(false);

      // Show success/error message
      if (errorProjects.length === 0) {
        showToast(
          `${approvedCount} projects approved successfully!`,
          "success"
        );
      } else {
        showToast(
          `${approvedCount} projects approved. Failed to approve: ${errorProjects.join(
            ", "
          )}`,
          "warning"
        );
      }
    } catch (error) {
      console.error("Error in bulk approve:", error);
      showToast("Failed to complete bulk approve operation.", "error");
    } finally {
      setIsApproving(false);
    }
  };

  // Bulk delete projects
  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      let deletedCount = 0;
      const errorProjects = [];

      const selectedIds = Object.keys(selectedProjects).filter(
        (id) => selectedProjects[id]
      );

      for (const projectId of selectedIds) {
        try {
          const project = projects.find((p) => p.id === projectId);
          const projectPath = `clients/${project.folderPath}/`;

          // List all files in the project folder
          const projectFiles = await listFiles(projectPath);

          // Delete each file including the project metadata
          for (const file of projectFiles) {
            if (file.path.endsWith("/")) {
              // This is a folder, need to list and delete its contents first
              const subFiles = await listFiles(file.path);
              for (const subFile of subFiles) {
                await deleteFile(subFile.path);
              }
            }

            // Now delete the file/folder itself
            await deleteFile(file.path);
          }

          deletedCount++;
        } catch (error) {
          console.error(`Error deleting project ${projectId}:`, error);
          const projectName =
            projects.find((p) => p.id === projectId)?.name || projectId;
          errorProjects.push(projectName);
        }
      }

      // Update UI state
      setProjects((prevProjects) =>
        prevProjects.filter((p) => !selectedProjects[p.id])
      );

      // Clear selections
      setSelectedProjects({});
      setSelectAll(false);
      setBulkDeleteModalOpen(false);

      // Show success/error message
      if (errorProjects.length === 0) {
        showToast(`${deletedCount} projects deleted successfully!`, "success");
      } else {
        showToast(
          `${deletedCount} projects deleted. Failed to delete: ${errorProjects.join(
            ", "
          )}`,
          "warning"
        );
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      showToast("Failed to complete bulk delete operation.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle expanded view for a project
  const toggleProjectExpand = async (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
      return;
    }

    setExpandedProjectId(projectId);
    setIsLoadingFiles(true);

    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error("Project not found");

      // List all files in the project folder
      const projectPath = `clients/${project.folderPath}/data/`;
      const projectDataFiles = await listFiles(projectPath);

      // Filter out any .uploadstate files
      const visibleFiles = projectDataFiles.filter((file) => {
        const filePath = file.path || file.key || "";
        return !filePath.endsWith(".uploadstate");
      });

      // Get file URLs and additional info
      const filesWithUrls = await Promise.all(
        visibleFiles.map(async (file) => {
          const url = await getFileUrl(file.path);
          return {
            ...file,
            url,
            size: formatFileSize(file.size),
            extension: file.path.split(".").pop().toLowerCase(),
            uploadDate: new Date().toLocaleDateString("en-GB"),
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

  // Handle file upload to an existing project
  const handleFileUpload = async (e) => {
    if (!activeProject) return;

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setIsLoadingFiles(true);

      // Get project path
      const projectPath = `clients/${activeProject.folderPath}/data/`;

      // Upload each file
      for (const file of files) {
        await uploadFile(file, `${projectPath}${file.name}`);
      }

      // Update project info
      const projectInfoPath = `clients/${activeProject.folderPath}/project-info.json`;
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

      // Upload updated project info
      await uploadFile(
        new Blob([JSON.stringify(projectInfo, null, 2)], {
          type: "application/json",
        }),
        projectInfoPath
      );

      // Update local state
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                files: projectDataFiles.length,
                size: formatFileSize(totalBytes),
              }
            : p
        )
      );

      // Refresh project files list
      await toggleProjectExpand(activeProject.id);

      showToast("Files uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading files:", error);
      showToast("Failed to upload files. Please try again.", "error");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Delete a single file from a project
  const handleDeleteFile = async (filePath) => {
    if (!activeProject) return;

    // Don't allow direct deletion of .uploadstate files
    if (filePath.endsWith(".uploadstate")) {
      showToast("Cannot delete system files directly.", "error");
      return;
    }

    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      setIsLoadingFiles(true);

      // Delete the file
      await deleteFile(filePath);

      // Also try to delete any associated .uploadstate file
      try {
        await deleteFile(`${filePath}.uploadstate`);
        console.log(`Deleted associated upload state file for ${filePath}`);
      } catch (err) {
        // It's okay if the .uploadstate file doesn't exist
        console.log("No upload state file found to delete");
      }

      // Update project info
      const projectInfoPath = `clients/${activeProject.folderPath}/project-info.json`;
      const fileUrl = await getFileUrl(projectInfoPath);
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch project info: ${response.status}`);
      }

      const projectInfo = await response.json();

      // Update file count and size - exclude .uploadstate files
      const projectPath = `clients/${activeProject.folderPath}/data/`;
      const allFiles = await listFiles(projectPath);
      const projectDataFiles = allFiles.filter((file) => {
        const itemPath = file.path || file.key || "";
        return !itemPath.endsWith(".uploadstate");
      });

      const totalBytes = projectDataFiles.reduce(
        (total, file) => total + file.size,
        0
      );

      projectInfo.totalBytes = totalBytes;
      projectInfo.fileCount = projectDataFiles.length;

      // Upload updated project info
      await uploadFile(
        new Blob([JSON.stringify(projectInfo, null, 2)], {
          type: "application/json",
        }),
        projectInfoPath
      );

      // Update local state
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                files: projectDataFiles.length,
                size: formatFileSize(totalBytes),
              }
            : p
        )
      );

      // Remove the deleted file from the list
      setProjectFiles((prevFiles) =>
        prevFiles.filter((file) => file.path !== filePath)
      );

      showToast("File deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("Failed to delete file. Please try again.", "error");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Modal opening functions
  const openDeleteModal = (project) => {
    setActiveProject(project);
    setDeleteModalOpen(true);
    setMenuOpenIndex(null);
  };

  const openApproveModal = (project) => {
    setActiveProject(project);
    setApproveModalOpen(true);
    setMenuOpenIndex(null);
  };

  // View project results
  const handleViewResults = (projectId) => {
    router.push(`/project/${projectId}/results`);
  };

  // Navigate to full project view
  const navigateToProjectView = (projectId) => {
    router.push(`/dashboard/projectview?project-id=${projectId}`);
  };

  // Toggle action menu for a project
  const toggleMenu = (index) => {
    setMenuOpenIndex(menuOpenIndex === index ? null : index);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  // Handle project selection
  const handleSelectProject = (e, projectId) => {
    e.stopPropagation();

    setSelectedProjects((prev) => {
      const newSelections = { ...prev };
      newSelections[projectId] = !prev[projectId];
      return newSelections;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedProjects({});
    } else {
      // Select all filtered projects
      const newSelections = {};
      filteredProjects.forEach((project) => {
        newSelections[project.id] = true;
      });
      setSelectedProjects(newSelections);
    }
    setSelectAll(!selectAll);
  };

  // Get count of selected projects
  const selectedCount = Object.values(selectedProjects).filter(Boolean).length;

  // Count of selected projects by status
  const selectedDraftWithFilesCount = projects.filter(
    (p) => selectedProjects[p.id] && p.status === "Draft" && p.files > 0
  ).length;

  // Show loading state
  if (isPageLoading) {
    return <LoadingSpinner fullPage={true} text="Loading your projects..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Your Projects</h1>
        <Link href="/dashboard/create-project">
          <button className={styles.createButton}>
            <FontAwesomeIcon
              icon={faPlus}
              className={styles.createButtonIcon}
            />
            <span className={styles.createButtonText}>New Project</span>
          </button>
        </Link>
      </div>

      <div className={styles.functionsBar}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search projects by name, company or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>

        {showBulkActions && (
          <div className={styles.bulkActionsBar}>
            <div className={styles.selectedCount}>
              <span>{selectedCount} projects selected</span>
            </div>
            <div className={styles.bulkActions}>
              {selectedDraftWithFilesCount > 0 && (
                <button
                  className={styles.bulkApproveButton}
                  onClick={() => setBulkApproveModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Approve Selected ({selectedDraftWithFilesCount})
                </button>
              )}
              <button
                className={styles.bulkDeleteButton}
                onClick={() => setBulkDeleteModalOpen(true)}
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.projectsContainer}>
        {filteredProjects.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.projectTable}>
              <thead>
                <tr>
                  <th className={styles.selectColumn}>
                    <div
                      className={styles.selectAllCheckbox}
                      onClick={handleSelectAll}
                    >
                      <FontAwesomeIcon
                        icon={selectAll ? faCheckSquare : faSquare}
                        className={
                          selectAll ? styles.checkboxChecked : styles.checkbox
                        }
                      />
                    </div>
                  </th>
                  <th>Project Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th className={styles.dateColumn}>
                    Date & Time
                    <button
                      className={styles.tableSortButton}
                      onClick={toggleSortOrder}
                    >
                      <FontAwesomeIcon
                        icon={sortOrder === "desc" ? faSortDown : faSortUp}
                      />
                    </button>
                  </th>
                  <th>Files</th>
                  <th>Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => {
                  // Using two rows with the same key prefix but different suffixes
                  const projectRowKey = `project-${project.id}`;
                  const expandedRowKey = `project-${project.id}-expanded`;
                  const { date, time } = formatDateTime(project.createdAt);
                  const isSelected = selectedProjects[project.id] || false;

                  return (
                    <React.Fragment key={projectRowKey}>
                      <tr
                        className={`${index % 2 === 1 ? styles.altRow : ""} ${
                          styles.hoverableRow
                        } ${isSelected ? styles.selectedRow : ""}`}
                        onClick={() => toggleProjectExpand(project.id)}
                      >
                        <td
                          className={styles.selectColumn}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className={styles.projectCheckbox}
                            onClick={(e) => handleSelectProject(e, project.id)}
                          >
                            <FontAwesomeIcon
                              icon={isSelected ? faCheckSquare : faSquare}
                              className={
                                isSelected
                                  ? styles.checkboxChecked
                                  : styles.checkbox
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <div className={styles.projectNameCell}>
                            {project.name}
                            <FontAwesomeIcon
                              icon={
                                expandedProjectId === project.id
                                  ? faChevronUp
                                  : faChevronDown
                              }
                              className={styles.expandIcon}
                            />
                          </div>
                        </td>
                        <td>{project.company}</td>
                        <td>
                          <span
                            className={`${styles.status} ${
                              project.status === "Completed"
                                ? styles.completed
                                : project.status === "Pending"
                                ? styles.pending
                                : styles.draft
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.dateTimeCell}>
                            <span className={styles.date}>{date}</span>
                            <span className={styles.time}>{time}</span>
                          </div>
                        </td>
                        <td>{project.files}</td>
                        <td>{project.size}</td>
                        <td className={styles.actionColumn}>
                          {renderProjectActions(project)}

                          {/* Always show full view button regardless of status */}
                          <button
                            className={styles.fullViewButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProjectView(project.id);
                            }}
                            title="View full project details"
                          >
                            <FontAwesomeIcon icon={faPen} />
                            Edit
                          </button>

                          {/* Menu options */}
                          <div className={styles.menuWrapper}>
                            <button
                              className={styles.menuButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(index);
                              }}
                              aria-label="Project options"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </button>

                            {menuOpenIndex === index && (
                              <div className={styles.menuDropdown}>
                                {project.status === "Draft" &&
                                  project.files > 0 && (
                                    <button
                                      className={styles.menuItem}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openApproveModal(project);
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        className={styles.menuItemIcon}
                                        icon={faCheckCircle}
                                      />
                                      <span className={styles.menuItemText}>
                                        Approve
                                      </span>
                                    </button>
                                  )}
                                <button
                                  className={styles.menuItem}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(project);
                                  }}
                                >
                                  <FontAwesomeIcon
                                    className={styles.menuItemIcon}
                                    icon={faTrash}
                                  />
                                  <span className={styles.menuItemText}>
                                    Delete
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded view for project details */}
                      {expandedProjectId === project.id && (
                        <tr
                          key={expandedRowKey}
                          className={styles.expandedRow}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <td colSpan="9">
                            <div className={styles.expandedContent}>
                              <div className={styles.expandedSection}>
                                <h3>Project Details</h3>
                                <div className={styles.projectDetails}>
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                      Description:
                                    </span>
                                    <span className={styles.detailValue}>
                                      {project.description}
                                    </span>
                                  </div>
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                      Created By:
                                    </span>
                                    <span className={styles.detailValue}>
                                      {extractFullName(user.username) || "Unknown"}
                                    </span>
                                  </div>
                                  <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>
                                      Created On:
                                    </span>
                                    <span className={styles.detailValue}>
                                      {date} at {time}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className={styles.expandedSection}>
                                <div className={styles.filesSectionHeader}>
                                  <h3>Files</h3>
                                  <div className={styles.fileActions}>
                                    <input
                                      type="file"
                                      multiple
                                      ref={fileInputRef}
                                      onChange={handleFileUpload}
                                      className={styles.hiddenFileInput}
                                    />
                                    {/* <button
                                      className={`${
                                        project.status !== "Draft"
                                          ? styles.uploadButtonDisabled
                                          : styles.uploadButton
                                      }`}
                                      onClick={() => {
                                        setActiveProject(project);
                                        fileInputRef.current.click();
                                      }}
                                      disabled={project.status !== "Draft"}
                                    >
                                      <FontAwesomeIcon icon={faPlus} />
                                      Add Files
                                    </button> */}
                                  </div>
                                </div>

                                {isLoadingFiles ? (
                                  <div className={styles.loadingFiles}>
                                    <div className={styles.spinnerSmall}></div>
                                    <span>Loading files...</span>
                                  </div>
                                ) : (
                                  <>
                                    {projectFiles.length > 0 ? (
                                      <div className={styles.filesGrid}>
                                        {projectFiles
                                          .filter((file) => {
                                            // Extra filter to ensure no .uploadstate files are displayed
                                            const fileName = file.path
                                              .split("/")
                                              .pop();
                                            return !fileName.endsWith(
                                              ".uploadstate"
                                            );
                                          })
                                          .map((file, fileIndex) => (
                                            <div
                                              key={`file-${fileIndex}`}
                                              className={styles.fileCard}
                                            >
                                              <div className={styles.fileIcon}>
                                                <FontAwesomeIcon
                                                  icon={faFileAlt}
                                                />
                                              </div>
                                              <div className={styles.fileInfo}>
                                                <span
                                                  className={styles.fileName}
                                                >
                                                  {file.path.split("/").pop()}
                                                </span>
                                                <span
                                                  className={styles.fileSize}
                                                >
                                                  {file.size}
                                                </span>
                                              </div>
                                              <button
                                                className={
                                                  styles.fileDeleteButton
                                                }
                                                onClick={() =>
                                                  handleDeleteFile(file.path)
                                                }
                                                title="Delete file"
                                                disabled={
                                                  project.status !== "Draft"
                                                }
                                              >
                                                <FontAwesomeIcon
                                                  icon={faTrash}
                                                />
                                              </button>
                                            </div>
                                          ))}
                                      </div>
                                    ) : (
                                      <div className={styles.noFiles}>
                                        <p>No files found in this project.</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyStateContainer}>
            {searchTerm ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateHeader}>
                  <div className={styles.emptyStateIcon}>
                    <FontAwesomeIcon
                      icon={faSearch}
                      className={styles.emptyStateIconIcon}
                    />
                  </div>
                  <div className={styles.emptyDescription}>
                    <h3>No Projects Found</h3>
                    <p>
                      No projects match your search for "{searchTerm}". Try a
                      different search term.
                    </p>
                  </div>
                </div>
                <button
                  className={styles.clearSearchButton}
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateHeader}>
                  <div className={styles.emptyStateIcon}>
                    <FontAwesomeIcon
                      icon={faBoxOpen}
                      className={styles.emptyStateIconIcon}
                    />
                  </div>
                  <div className={styles.emptyDescription}>
                    <h3>No Projects Yet</h3>
                    <p>
                      You don't have any projects yet. Create your first project
                      to get started.
                    </p>
                  </div>
                </div>

                <Link href="/dashboard/create-project">
                  <button className={styles.createButtonFull}>
                    <FontAwesomeIcon
                      icon={faPlus}
                      className={styles.createButtonIcon}
                    />
                    <span className={styles.createButtonText}>New Project</span>
                  </button>
                </Link>
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
                Are you sure you want to delete{" "}
                <strong>{activeProject?.name}</strong>? This action cannot be
                undone.
              </p>
              <p className={styles.confirmInstructions}>
                Type <strong>{activeProject?.name}</strong> below to confirm:
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
                disabled={confirmText !== activeProject?.name || isDeleting}
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
                You're about to approve <strong>{activeProject?.name}</strong>{" "}
                for processing.
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

      {/* Bulk Delete Modal */}
      {bulkDeleteModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isDeleting && setBulkDeleteModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Multiple Projects</h2>
              {!isDeleting && (
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setBulkDeleteModalOpen(false)}
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
                Are you sure you want to delete <strong>{selectedCount}</strong>{" "}
                projects? This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalActions}>
              {!isDeleting && (
                <button
                  className={styles.cancelButton}
                  onClick={() => setBulkDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              )}
              <button
                className={styles.confirmDeleteButton}
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className={styles.spinnerSmall}></div>
                    Deleting...
                  </>
                ) : (
                  `Delete ${selectedCount} Projects`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Modal */}
      {bulkApproveModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isApproving && setBulkApproveModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Approve Multiple Projects</h2>
              {!isApproving && (
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setBulkApproveModalOpen(false)}
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
                You're about to approve{" "}
                <strong>{selectedDraftWithFilesCount}</strong> projects for
                processing.
              </p>
              <p className={styles.approveInstructions}>
                Once approved, these projects will be sent to our data engineers
                for review. The project status will change to "Pending" until
                processing begins.
              </p>
              <p className={styles.noteText}>
                Note: Only projects in Draft status with uploaded files will be
                approved. ({selectedCount - selectedDraftWithFilesCount} of your
                selected projects will be skipped)
              </p>
            </div>
            <div className={styles.modalActions}>
              {!isApproving && (
                <button
                  className={styles.cancelButton}
                  onClick={() => setBulkApproveModalOpen(false)}
                >
                  Cancel
                </button>
              )}
              <button
                className={styles.confirmApproveButton}
                onClick={handleBulkApprove}
                disabled={isApproving || selectedDraftWithFilesCount === 0}
              >
                {isApproving ? (
                  <>
                    <div className={styles.spinnerSmall}></div>
                    Approving...
                  </>
                ) : (
                  `Approve ${selectedDraftWithFilesCount} Projects`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
