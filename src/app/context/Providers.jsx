"use client";
// File: src/context/AmplifyProvider.js
import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  signOut,
  fetchAuthSession,
  signIn,
} from "aws-amplify/auth";
import {
  uploadData,
  list,
  remove,
  getUrl,
  getProperties,
} from "aws-amplify/storage";
import { useRouter } from "next/navigation";
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { extractFullName } from "@/utils";

const DEV = true;

const devConfig = {
  Auth: {
    Cognito: {
      mandatorySignIn: true,
      userPoolId: "eu-west-2_lHtoXsEQH",
      userPoolClientId: "7p98235po3dgigtue9195ut4rj",
      identityPoolId: "eu-west-2:2f9b085b-e95b-4efa-901b-0d6af32507ac",
      region: "eu-west-2",
      loginWith: {
        email: true,
        externalProviders: {
          google: {
            clientId:
              "44207520238-6p3noq35todiifhqeqpsshg953snehqh.apps.googleusercontent.com",
            scopes: ["openid", "email", "profile"],
          },
          apple: {
            clientId: "com.yarkeylimited.gcsesimulator",
            scopes: ["email", "name"],
          },
        },
        oauth: {
          domain: "eu-west-2lhtoxseqh.auth.eu-west-2.amazoncognito.com",
          scopes: [
            "openid",
            "email",
            "phone",
            "profile",
            "aws.cognito.signin.user.admin",
          ],
          redirectSignIn: [
            "http://localhost:3000/login",
            "https://eu-west-2lhtoxseqh.auth.eu-west-2.amazoncognito.com/oauth2/idpresponse",
            "https://semblancy.com/login",
            "https://dev.semblancy.com/login",
            "https://semblancy.co.uk/login",
            "https://dev.semblancy.co.uk/login",
          ],
          // Important: We're handling redirect manually in the app,
          // so don't include a redirectSignOut URL to prevent Cognito's automatic redirect
          redirectSignOut: [],
          responseType: "code",
        },
      },
    },
  },
  Storage: {
    S3: {
      bucket: "semblancy",
      region: "eu-west-2",
      level: "private",
      identityPoolId: "eu-west-2:2f9b085b-e95b-4efa-901b-0d6af32507ac",
    },
  },
};

const prodConfig = {
  Auth: {
    Cognito: {
      mandatorySignIn: true,
      userPoolId: "eu-west-1_eyDmaqzdy",
      userPoolClientId: "2b2gjm8b43s6admu7k6tv9h861",
      identityPoolId: "eu-west-1:d0f61e5e-9b11-4739-9688-aafe68705fe2",
      region: "eu-west-1",
      loginWith: {
        email: true,
        externalProviders: {
          google: {
            clientId:
              "44207520238-6p3noq35todiifhqeqpsshg953snehqh.apps.googleusercontent.com",
            scopes: ["openid", "email", "profile"],
          },
          apple: {
            clientId: "com.yarkeylimited.gcsesimulator",
            scopes: ["email", "name"],
          },
        },
        oauth: {
          domain: "auth.semblancy.co.uk",
          scopes: [
            "openid",
            "email",
            "phone",
            "profile",
            "aws.cognito.signin.user.admin",
          ],
          redirectSignIn: [
            "http://localhost:3000/dashboard/overview",
            "https://semblancy.co.uk/dashboard/overview",
            "http://localhost:3000/auth-callback",
            "https://semblancy.co.uk/auth-callback",
          ],
          // Important: We're handling redirect manually in the app,
          // so don't include a redirectSignOut URL to prevent Cognito's automatic redirect
          redirectSignOut: [],
          responseType: "code",
        },
      },
    },
  },
  Storage: {
    S3: {
      bucket: "batch-data-input",
      region: "eu-west-1",
      level: "private",
      identityPoolId: "eu-west-1:d0f61e5e-9b11-4739-9688-aafe68705fe2",
      useAccelerateEndpoint: true,
      customEndpoint: "https://batch-data-input.s3-accelerate.amazonaws.com",
    },
  },
};

// Configure Amplify once
Amplify.configure(DEV ? devConfig : prodConfig);

// Create context
const AmplifyContext = createContext(null);

export function AmplifyProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    identityId: null,
    isAuthenticated: false,
    session: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState(null);
  const router = useRouter();

  // Check for active session on component mount and listen for auth events
  useEffect(() => {
    checkSession();

    // Set up Hub listener for auth events
    const authListener = ({ payload }) => {
      console.log(`Auth event: ${payload.event}`);

      switch (payload.event) {
        case "signIn":
          console.log("User signed in");
          checkSession();
          break;
        case "signOut":
          console.log("User signed out");
          handleSessionCleanup();
          break;
        case "tokenRefresh":
          console.log("Token refreshed");
          checkSession();
          break;
        case "tokenRefresh_failure":
          console.log("Token refresh failed");
          handleSessionCleanup();
          break;
      }
    };

    Hub.listen("auth", authListener);

    // Clean up listener on unmount
    return () => {
      const removeListener = Hub.listen("auth", authListener);
      return removeListener();
    };
  }, [router]);

  const checkResumableUpload = async (filePath) => {
    try {
      // Check for an upload state file
      const uploadStatePath = `${filePath}.uploadstate`;
      const files = await list({ path: uploadStatePath });

      if (files && files.items && files.items.length > 0) {
        // Get the upload state
        const { url } = await getUrl({ path: uploadStatePath });
        const response = await fetch(url);

        if (response.ok) {
          const uploadState = await response.json();
          return {
            resumable: true,
            uploadState,
          };
        }
      }

      return { resumable: false };
    } catch (error) {
      console.error("Error checking resumable upload:", error);
      return { resumable: false };
    }
  };

  // Function to save upload state for resumability
  // Enhanced saveUploadState with retry and backoff
  const saveUploadState = async (filePath, uploadState, attempt = 1) => {
    try {
      const uploadStatePath = `${filePath}.uploadstate`;

      // Implement rate limiting protection
      const maxAttempts = 5;
      const baseDelay = 1000; // 1 second base delay

      try {
        await uploadData({
          path: uploadStatePath,
          data: new Blob([JSON.stringify(uploadState)], {
            type: "application/json",
          }),
          options: {
            accessLevel: "private",
          },
        }).result;
        return true;
      } catch (error) {
        // Check if it's a rate limiting error (503 Slow Down)
        if (error.statusCode === 503 && attempt < maxAttempts) {
          // Calculate exponential backoff with jitter
          const delay = Math.min(
            baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
            30000 // Max 30 second delay
          );

          console.log(
            `Rate limited when saving upload state. Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`
          );

          // Wait and retry with increased attempt count
          await new Promise((resolve) => setTimeout(resolve, delay));
          return saveUploadState(filePath, uploadState, attempt + 1);
        }

        // Rethrow other errors or if max attempts reached
        throw error;
      }
    } catch (error) {
      console.error("Error saving upload state:", error);
      return false;
    }
  };

  const getAWSCredentials = async () => {
    const session = await fetchAuthSession();
    if (!session || !session.credentials) {
      throw new Error("No valid authentication session");
    }
    return session.credentials;
  };  

  // Function to clear upload state when complete
  const clearUploadState = async (filePath) => {
    try {
      const uploadStatePath = `${filePath}.uploadstate`;
      await remove({ path: uploadStatePath });
      return true;
    } catch (error) {
      console.error("Error clearing upload state:", error);
      return false;
    }
  };

  // Enhanced upload function with resumability
  const uploadFileResumable = async (
    file,
    filePath,
    progressCallback = null,
    signal = null,
    isResuming = false
  ) => {
    try {
      if (!authState.identityId) {
        throw new Error("User not authenticated");
      }

      // Check if we can resume an existing upload
      let existingUploadState = null;
      if (!isResuming) {
        const resumableCheck = await checkResumableUpload(filePath);
        if (resumableCheck.resumable) {
          existingUploadState = resumableCheck.uploadState;
          console.log(`Resuming upload for ${filePath}`);
        }
      }

      // Calculate optimal chunk sizes based on file size
      const { partSize, maxConcurrentParts } = calculateOptimalChunkSizes(
        file.size
      );

      // Create a unique upload ID if we're not resuming
      const uploadId =
        existingUploadState?.uploadId ||
        `upload_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      // Initialize upload state tracking
      let uploadState = existingUploadState || {
        uploadId,
        filePath,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || "application/octet-stream",
        partSize,
        partsCompleted: [],
        startedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        progress: 0,
      };

      // Save initial upload state if starting fresh
      if (!existingUploadState) {
        await saveUploadState(filePath, uploadState);
      }

      // Helper function to update progress and state
      const updateProgress = async (partNumber, progress) => {
        // Update progress tracking
        if (progressCallback) {
          progressCallback(progress);
        }

        // Update upload state
        uploadState.progress = progress;
        uploadState.lastUpdated = new Date().toISOString();

        if (
          progress === 100 &&
          !uploadState.partsCompleted.includes(partNumber)
        ) {
          uploadState.partsCompleted.push(partNumber);
        }

        // Save updated state periodically (every 5% progress change)
        if (progress % 5 === 0) {
          await saveUploadState(filePath, uploadState);
        }
      };

      // Create enhanced upload options
      const uploadOptions = {
        accessLevel: "private",
        contentType: file.type || "application/octet-stream",
        multipartUpload: file.size > 5 * 1024 * 1024, // Only for files > 5MB
        partSize: partSize,
        queueSize: maxConcurrentParts,
        accelerate: true,
        abortSignal: signal,
        onProgress: async (progress) => {
          // Normalize progress value
          let percentComplete;
          if (typeof progress === "number") {
            percentComplete = progress;
          } else if (progress && typeof progress === "object") {
            if ("transferredBytes" in progress && "totalBytes" in progress) {
              percentComplete =
                progress.totalBytes > 0
                  ? Math.round(
                      (progress.transferredBytes / progress.totalBytes) * 100
                    )
                  : 0;
            } else if ("loaded" in progress && "total" in progress) {
              percentComplete =
                progress.total > 0
                  ? Math.round((progress.loaded / progress.total) * 100)
                  : 0;
            } else {
              return;
            }
          } else {
            return;
          }

          // Get part number if available
          const partNumber = progress.partNumber || 1;

          // Update progress state
          await updateProgress(partNumber, percentComplete);
        },
      };

      // Execute the upload with enhanced options
      const result = await uploadData({
        path: filePath,
        data: file,
        options: uploadOptions,
      }).result;

      // Update final state and clear upload state file when complete
      uploadState.progress = 100;
      uploadState.status = "completed";
      uploadState.completedAt = new Date().toISOString();
      await saveUploadState(filePath, uploadState);

      // Only clear the upload state if we've completely finished
      // and this isn't part of a "save for later" flow
      if (!isResuming) {
        await clearUploadState(filePath);
      }

      return {
        key: filePath,
        result,
        uploadState,
      };
    } catch (error) {
      // Check if this is an abort error
      if (
        error.name === "AbortError" ||
        (error.message && error.message.includes("aborted"))
      ) {
        console.log(`Upload of ${file.name} was aborted`);
        throw new Error("Upload aborted");
      }

      console.error("Error uploading file:", error);
      throw error;
    }
  };

  // Function to check for incomplete uploads in a project
  const checkProjectUploads = async (projectFolderPath) => {
    try {
      // List all files in the project folder with pagination
      const uploadStateFiles = await list({
        path: projectFolderPath,
        options: {
          pageSize: 1000, // Use a numeric value for pageSize
          recursive: true,
        },
      });

      // Filter to only get .uploadstate files
      const incompleteUploads = uploadStateFiles.items
        .filter((item) => {
          // Safely check if the key/path ends with .uploadstate
          const itemPath = item.key || item.path || "";
          return itemPath.endsWith(".uploadstate");
        })
        .map((item) => {
          // Safely get the key/path and remove .uploadstate
          const itemPath = item.key || item.path || "";
          return itemPath.replace(".uploadstate", "");
        });

      return {
        hasIncompleteUploads: incompleteUploads.length > 0,
        incompleteUploads,
      };
    } catch (error) {
      console.error("Error checking project uploads:", error);
      return { hasIncompleteUploads: false, incompleteUploads: [] };
    }
  };

  const initiatePasswordReset = async (username) => {
    try {
      setIsLoading(true);
      const result = await resetPassword({ username });
      setIsLoading(false);
      return { success: true, delivery: result.delivery };
    } catch (error) {
      console.error("Error initiating password reset:", error);
      setIsLoading(false);

      if (error.name === "UserNotFoundException") {
        return { success: false, message: "No account found with this email." };
      } else if (error.name === "LimitExceededException") {
        return {
          success: false,
          message: "Too many attempts. Please try again later.",
        };
      } else {
        return {
          success: false,
          message: error.message || "Failed to initiate password reset.",
        };
      }
    }
  };

  const completePasswordReset = async (username, code, newPassword) => {
    try {
      setIsLoading(true);
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword,
      });
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Error completing password reset:", error);
      setIsLoading(false);

      if (error.name === "CodeMismatchException") {
        return { success: false, message: "Invalid verification code." };
      } else if (error.name === "ExpiredCodeException") {
        return {
          success: false,
          message: "Verification code has expired. Please request a new one.",
        };
      } else if (error.name === "InvalidPasswordException") {
        return {
          success: false,
          message: error.message || "Password does not meet requirements.",
        };
      } else {
        return {
          success: false,
          message: error.message || "Failed to reset password.",
        };
      }
    }
  };

  const checkEmailExists = async (email) => {
    try {
      // Try to sign in with the email and a dummy password
      await signIn({
        username: email,
        password: "DummyPassword123!", // Will fail, but error type matters
      });

      // If sign-in succeeds (unlikely), account exists
      return true;
    } catch (err) {
      console.log("Sign in check error:", err);

      // UserNotFoundException means account doesn't exist
      if (err.name === "UserNotFoundException") {
        return false;
      }

      // NotAuthorizedException with incorrect credentials means user exists
      if (
        err.name === "NotAuthorizedException" &&
        err.message.includes("Incorrect username or password")
      ) {
        return true;
      }

      // For other errors, default to false to allow signup attempt
      return false;
    }
  };

  // Extract first and last name from a full name
  const getFirstLastName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.split(" ");
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  };

  // Modified ensureUserPreferences function to use auth data
  const ensureUserPreferences = async (identityId, authState) => {
    if (!identityId || !authState.user) return null;

    const user = authState.user;

    try {
      // The user's preferences file path
      const preferencesPath = `profiles/${identityId}/user-preferences.json`;

      // Try to list files to check if preferences exist
      const listResult = await list({
        path: `profiles/${identityId}/`,
        options: { accessLevel: "private" },
      });

      // Check if preferences file exists - safely check item properties
      const preferencesExists = listResult.items.some((item) => {
        // Different versions of Amplify might use different property names
        const itemPath = item.key || item.path || "";
        return (
          itemPath === preferencesPath ||
          itemPath.endsWith("/user-preferences.json")
        );
      });

      // If preferences exist, try to get them
      if (preferencesExists) {
        try {
          const { url } = await getUrl({ path: preferencesPath });
          const response = await fetch(url);

          if (response.ok) {
            const preferences = await response.json();
            console.log(`User preferences loaded for ${user.username}`);
            // const users = await getCurrentUser();
            // console.log(users);

            setUserPreferences(preferences);
            return preferences;
          }
        } catch (error) {
          console.error("Error getting existing preferences:", error);
        }
      }

      // Create default preferences if they don't exist or couldn't be retrieved
      console.log(`Creating preferences for user: ${user.username}`);

      // Extract user name info
      const fullName = extractFullName(user.username);
      const { firstName, lastName } = getFirstLastName(fullName);

      // Get user email from auth info
      const email = authState.session.tokens.idToken.payload.email || "";

      // Default preferences with user info
      const defaultPreferences = {
        firstName,
        lastName,
        email,
        company: "",
        jobTitle: "",
        theme: "light", // Default theme
        notifications: {
          emailNotifications: true,
          projectCompletions: true,
          newMessages: true,
          systemUpdates: false,
          marketingEmails: false,
        },
        compactView: false,
        sessionTimeout: "30", // 30 minutes
        profilePicture: null,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      // Upload the default preferences
      await uploadData({
        path: preferencesPath,
        data: new Blob([JSON.stringify(defaultPreferences, null, 2)], {
          type: "application/json",
        }),
        options: {
          accessLevel: "private",
        },
      }).result;

      console.log(`Preferences created for ${user.username}`);
      setUserPreferences(defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error("Error ensuring user preferences:", error);
      return null;
    }
  };

  // Function to update user preferences
  const updateUserPreferences = async (preferences) => {
    if (!authState.identityId || !authState.user) {
      throw new Error("User not authenticated");
    }

    try {
      const preferencesPath = `profiles/${authState.identityId}/user-preferences.json`;

      // Merge with existing preferences to avoid losing fields
      const updatedPreferences = {
        ...(userPreferences || {}),
        ...preferences,
        lastUpdated: new Date().toISOString(),
      };

      // Upload the updated preferences
      await uploadData({
        path: preferencesPath,
        data: new Blob([JSON.stringify(updatedPreferences, null, 2)], {
          type: "application/json",
        }),
        options: {
          accessLevel: "private",
        },
      }).result;

      // Update state
      setUserPreferences(updatedPreferences);

      // Dispatch theme change event if theme was updated
      if (preferences.theme) {
        const event = new CustomEvent("themeChange", {
          detail: { theme: preferences.theme },
        });
        window.dispatchEvent(event);

        // Also store in localStorage as fallback
        localStorage.setItem("theme", preferences.theme);
      }

      return updatedPreferences;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  };

  // Function to get current user preferences
  const getUserPreferences = async () => {
    if (!authState.identityId || !authState.user) {
      throw new Error("User not authenticated");
    }

    // If we already have preferences in state, return them
    if (userPreferences) {
      return userPreferences;
    }

    try {
      const preferencesPath = `profiles/${authState.identityId}/user-preferences.json`;

      try {
        const { url } = await getUrl({ path: preferencesPath });
        const response = await fetch(url);

        if (response.ok) {
          const preferences = await response.json();
          setUserPreferences(preferences);
          return preferences;
        }
      } catch (error) {
        console.log("Preferences not found, creating new ones");
      }

      // If file doesn't exist or can't be retrieved, create it
      return await ensureUserPreferences(authState.identityId, authState);
    } catch (error) {
      console.error("Error getting user preferences:", error);
      // Create new preferences if can't retrieve
      return await ensureUserPreferences(authState.identityId, authState);
    }
  };

  const checkSession = async () => {
    try {
      setIsLoading(true);

      // Get the current session
      const session = await fetchAuthSession();

      if (!session || !session.tokens) {
        console.log("No valid session found");
        handleSessionCleanup();
        return;
      }

      // Get the current authenticated user
      const currentUser = await getCurrentUser();

      // *** ADD THIS LOGGING FOR DEBUGGING ***
      console.log("Current authenticated user details:", {
        username: currentUser.username,
        userId: currentUser.userId,
        signInDetails: currentUser.signInDetails,
        attributes: currentUser.attributes,
        // Log all properties to see what's available
        ...currentUser,
      });

      const newAuthState = {
        user: currentUser,
        identityId: session.identityId,
        isAuthenticated: true,
        session: session,
      };

      setAuthState(newAuthState);

      // Create user folder if not exists
      // await ensureUserFolder(session.identityId, newAuthState);

      // Ensure user preferences exist
      // await ensureUserPreferences(session.identityId, newAuthState);

      console.log(`Session active for user: ${currentUser.username}`);
    } catch (error) {
      console.error("Session check failed:", error);
      handleSessionCleanup();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session cleanup on logout or session expiry
  const handleSessionCleanup = () => {
    setAuthState({
      user: null,
      identityId: null,
      isAuthenticated: false,
      session: null,
    });
    setUserPreferences(null);
  };

  // Ensure user folder exists
  const ensureUserFolder = async (identityId, user) => {
    if (!identityId || !user) return;

    try {
      // The user's folder path
      const userFolder = `profiles/${identityId}/`;

      // Check if folder exists by listing its contents
      const listResult = await list({ path: userFolder });

      // Create folder if it doesn't exist or is empty
      if (!listResult.items || listResult.items.length === 0) {
        await createUserFolder(identityId, user);
      } else {
        console.log(`User folder exists for ${user.username} (${identityId})`);
      }
    } catch (error) {
      console.error("Error checking user folder:", error);
      // Try to create folder if listing failed (might be due to non-existent folder)
      await createUserFolder(identityId, user);
    }
  };

  // Create user folder with marker file
  const createUserFolder = async (identityId, user) => {
    try {
      console.log(`Creating folder for user: ${user.username} (${identityId})`);

      // Create a marker file in the user's folder
      await uploadData({
        path: `profiles/${identityId}/user-folder.json`,
        data: new Blob(
          [
            JSON.stringify({
              created: new Date().toISOString(),
              username: user.username,
              userId: user.userId,
            }),
          ],
          { type: "application/json" }
        ),
        options: {
          accessLevel: "private",
        },
      }).result;

      console.log(`Folder created for ${user.username}`);
      return true;
    } catch (error) {
      console.error("Error creating user folder:", error);
      return false;
    }
  };

  // Sign out and redirect to login
  const handleSignOut = async () => {
    try {
      // First clean up the local session state
      handleSessionCleanup();

      // Use signOut without redirect to prevent Cognito from redirecting to its hosted UI
      await signOut({
        global: true,
        // Prevent automatic redirection by the Amplify library
        options: {
          // This tells Amplify to use the browser directly without redirection
          browser: false,
        },
      });

      // Manually redirect to login page after session cleanup
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Force cleanup even if sign out API call fails
      handleSessionCleanup();
      router.push("/login");
    }
  };

  // Upload file to user's storage
  // Then, replace your uploadFile function with this optimized version
  // In AmplifyProvider.jsx, modify the uploadFile function:
  const uploadFile = async (
    file,
    customPath = null,
    progressCallback = null,
    signal = null,
    options = {} // Add options parameter to receive isPaused and isCancelled flags
  ) => {
    try {
      if (!authState.identityId) {
        throw new Error("User not authenticated");
      }

      // Extract pause/cancel flags from options, default to false
      const isPaused = options.isPaused || false;
      const isCancelled = options.isCancelled || false;

      // Create a wrapper for the progress callback that checks isPaused
      const pauseAwareProgressCallback = (progress) => {
        // Skip if cancelled
        if (isCancelled) return;

        // Only call the original callback when not paused
        if (!isPaused && progressCallback) {
          // Normalize progress format
          let normalizedProgress;

          if (typeof progress === "number") {
            normalizedProgress = progress;
          } else if (progress && typeof progress === "object") {
            if ("transferredBytes" in progress && "totalBytes" in progress) {
              // Amplify Gen 2 format
              normalizedProgress =
                progress.totalBytes > 0
                  ? Math.round(
                      (progress.transferredBytes / progress.totalBytes) * 100
                    )
                  : 0;
            } else if ("loaded" in progress && "total" in progress) {
              // Amplify Gen 1 format
              normalizedProgress =
                progress.total > 0
                  ? Math.round((progress.loaded / progress.total) * 100)
                  : 0;
            } else {
              console.warn("Unrecognized progress format:", progress);
              return;
            }
          } else {
            console.warn("Invalid progress format:", progress);
            return;
          }

          // Call the original progress callback with normalized progress
          progressCallback(normalizedProgress);
        }
      };

      const fileName =
        customPath ||
        `profiles/${authState.identityId}/uploads/${Date.now()}-${file.name}`;

      // Calculate optimal chunk sizes based on file size
      const { partSize, maxConcurrentParts } = calculateOptimalChunkSizes(
        file.size
      );

      // Create enhanced upload options
      const uploadOptions = {
        accessLevel: "private",
        contentType: file.type || "application/octet-stream",
        multipartUpload: file.size > 5 * 1024 * 1024, // Only for files > 5MB
        partSize: partSize,
        queueSize: maxConcurrentParts,
        accelerate: true,
        abortSignal: signal,
        onProgress: pauseAwareProgressCallback,
      };

      // Execute the upload with enhanced options
      const result = await uploadData({
        path: fileName,
        data: file,
        options: uploadOptions,
      }).result;

      return {
        key: fileName,
        result,
      };
    } catch (error) {
      // Check if this is an abort error
      if (
        error.name === "AbortError" ||
        (error.message && error.message.includes("aborted"))
      ) {
        console.log(`Upload of ${file.name} was aborted`);
        throw new Error("Upload aborted");
      }

      console.error("Error uploading file:", error);
      throw error;
    }
  };

  // Helper function to calculate optimal chunk sizes
  const calculateOptimalChunkSizes = (fileSize) => {
    // Base chunk size
    let partSize = 5 * 1024 * 1024; // 5MB (S3 minimum for multipart)
    let maxConcurrentParts = 4; // Default concurrent parts

    // Adjust part size and concurrency based on file size
    if (fileSize > 5 * 1024 * 1024 * 1024) {
      // > 5GB
      partSize = 100 * 1024 * 1024; // 100MB chunks
      maxConcurrentParts = 10; // Higher concurrency
    } else if (fileSize > 1024 * 1024 * 1024) {
      // > 1GB
      partSize = 50 * 1024 * 1024; // 50MB chunks
      maxConcurrentParts = 8;
    } else if (fileSize > 100 * 1024 * 1024) {
      // > 100MB
      partSize = 25 * 1024 * 1024; // 25MB chunks
      maxConcurrentParts = 6;
    } else if (fileSize > 50 * 1024 * 1024) {
      // > 50MB
      partSize = 10 * 1024 * 1024; // 10MB chunks
      maxConcurrentParts = 5;
    }

    // Calculate number of parts
    const numParts = Math.ceil(fileSize / partSize);

    // Ensure we don't exceed the AWS S3 maximum of 10,000 parts
    if (numParts > 10000) {
      partSize = Math.ceil(fileSize / 9999); // Adjust to stay under limit
    }

    return { partSize, maxConcurrentParts };
  };

  // Simple utility function to format file sizes
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(2) + " GB";
  };

  // Delete file from storage
  const deleteFile = async (path) => {
    try {
      await remove({ path });
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  };

  // Get signed URL for a file
  const getFileUrl = async (key) => {
    try {
      const { url } = await getUrl({ path: key });
      return url;
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  };

  // List files in a path
  // List files in a path with pagination support
  const listFiles = async (path, options = {}) => {
    try {
      const allItems = [];
      let nextToken = null;

      // Configure options with pagination defaults
      const listOptions = {
        pageSize: options.pageSize || 1000,
        recursive: options.recursive || false,
        ...options,
      };

      // Initial request
      let result = await list({
        path,
        options: listOptions,
      });

      // Add items from first request
      if (result.items) {
        allItems.push(...result.items);
      }

      // Continue fetching if there are more items (nextToken exists)
      while (result.nextToken) {
        // Update options with the nextToken
        listOptions.nextToken = result.nextToken;

        // Make next request
        result = await list({
          path,
          options: listOptions,
        });

        // Add items from subsequent request
        if (result.items) {
          allItems.push(...result.items);
        }
      }

      return allItems;
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  };

  // Add this function to your existing provider:
  const checkAuthState = async () => {
    try {
      setIsLoading(true);

      // Get the current session
      const session = await fetchAuthSession();

      if (!session || !session.tokens) {
        console.log("No valid session found");
        handleSessionCleanup();
        return false;
      }

      // Get the current authenticated user
      const currentUser = await getCurrentUser();

      const newAuthState = {
        user: currentUser,
        identityId: session.identityId,
        isAuthenticated: true,
        session: session,
      };

      setAuthState(newAuthState);

      // Create user folder if not exists
      ensureUserFolder(session.identityId, newAuthState);

      // Ensure user preferences
      ensureUserPreferences(session.identityId, newAuthState);

      console.log(`Session active for user: ${currentUser.username}`);
      return true;
    } catch (error) {
      console.error("Session check failed:", error);
      handleSessionCleanup();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value with all exported functions and state
  const value = {
    // Auth state
    user: authState.user,
    identityId: authState.identityId,
    isAuthenticated: authState.isAuthenticated,
    session: authState.session,
    isLoading,

    // Auth functions
    signOut: handleSignOut,
    checkAuthState,
    checkSession,

    // Storage functions
    uploadFile: (file, customPath, progressCallback, signal) =>
      uploadFile(file, customPath, progressCallback, signal),
    deleteFile,
    getFileUrl,
    listFiles,
    createUserFolder: () =>
      createUserFolder(authState.identityId, authState.user),
    checkEmailExists,
    initiatePasswordReset,
    completePasswordReset,

    // User preferences
    userPreferences,
    ensureUserPreferences: () =>
      ensureUserPreferences(authState.identityId, authState),
    getUserPreferences,
    updateUserPreferences,

    uploadFileResumable,
    checkResumableUpload,
    saveUploadState,
    clearUploadState,
    checkProjectUploads,
    getAWSCredentials
  };

  return (
    <AmplifyContext.Provider value={value}>{children}</AmplifyContext.Provider>
  );
}

export function useAmplify() {
  const context = useContext(AmplifyContext);
  if (!context) {
    throw new Error("useAmplify must be used within an AmplifyProvider");
  }
  return context;
}
