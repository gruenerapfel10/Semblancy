"use client";
// File: app/login/page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, confirmSignUp } from "aws-amplify/auth";
import { useAmplify } from "../Providers";
import Modal from "../../components/Modal";
import styles from "./login.module.css";
import Image from "next/image";
import Logo from "@/components/Logo";
import VerticalSpacer from "@/components/VerticalSpacer"

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const router = useRouter();
  const { checkAuthState, isAuthenticated, user } = useAmplify();

  useEffect(() => {
    // Prevent checking auth multiple times
    if (authCheckComplete) return;

    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const isSignedIn = await checkAuthState();
        
        // If authenticated, redirect to dashboard
        if (isSignedIn) {
          console.log("User already authenticated, redirecting to dashboard");
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        // Mark auth check as complete to prevent re-running
        setAuthCheckComplete(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();

    // Auto-fill username if passed from signup page
    const params = new URLSearchParams(window.location.search);
    const usernameParam = params.get("username");
    if (usernameParam) {
      setUsername(usernameParam);
    }

    // Show success message if coming from signup page
    if (params.get("signupSuccess")) {
      setSuccessMessage("Account created successfully! Please log in.");
    }

    // Show success message if coming from confirmation page
    if (params.get("confirmSuccess")) {
      setSuccessMessage("Account confirmed successfully! Please log in.");
    }
  }, []); // Remove dependencies to prevent loops

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // First attempt to sign in
      const signInResult = await signIn({ username, password });
      console.log("Sign in successful:", signInResult);

      // Check if user needs additional confirmation steps
      if (
        signInResult.nextStep &&
        signInResult.nextStep.signInStep !== "DONE"
      ) {
        console.log("Additional steps required:", signInResult.nextStep);

        // Handle different confirmation scenarios
        if (
          signInResult.nextStep.signInStep ===
          "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD"
        ) {
          setError(
            "You need to set a new password. Please contact an administrator."
          );
        } else if (signInResult.nextStep.signInStep === "CONFIRM_SIGN_UP") {
          setError("Your account needs confirmation.");
          setShowConfirmation(true);
        } else {
          setError(
            `Additional authentication step required: ${signInResult.nextStep.signInStep}`
          );
        }
        setIsLoading(false);
        return;
      }

      // Update auth state and store login success in sessionStorage
      await checkAuthState();

      // Set a flag in sessionStorage that we just logged in successfully
      sessionStorage.setItem("justLoggedIn", "true");

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      // Handle different error types
      if (err.name === "NotAuthorizedException") {
        if (err.message.includes("User is not confirmed")) {
          setError("Your account needs confirmation.");
          setShowConfirmation(true);
        } else if (err.message.includes("Incorrect username or password")) {
          setError("Incorrect username or password. Please try again.");
        } else {
          setError("Authentication failed. Please check your credentials.");
        }
      } else if (err.name === "UserNotConfirmedException") {
        setError("Your account needs confirmation.");
        setShowConfirmation(true);
      } else if (err.name === "UserNotFoundException") {
        setError("Account not found. Please check your username or sign up.");
      } else if (err.name === "LimitExceededException") {
        setError("Too many attempts. Please try again later.");
      } else if (err.name === "NetworkError") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          err.message || "An error occurred during login. Please try again."
        );
      }

      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setConfirmError("");

    try {
      const result = await confirmSignUp({
        username,
        confirmationCode,
      });

      if (result.isSignUpComplete) {
        setSuccessMessage("Account confirmed successfully! Please log in.");
        setShowConfirmation(false);
        setConfirmationCode("");
      }
    } catch (err) {
      console.error("Confirmation error:", err);

      if (err.name === "CodeMismatchException") {
        setConfirmError("Invalid code. Please try again.");
      } else if (err.name === "ExpiredCodeException") {
        console.log(err)
        setConfirmError("Code has expired. Please request a new one.");
      } else if (err.name === "NetworkError") {
        setConfirmError("Network error. Please check your connection.");
      } else {
        setConfirmError(err.message || "Error confirming account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading && !authCheckComplete) {
    return (
      <div className={styles.authContainer}>
        <Logo size="xl" />
        <VerticalSpacer height="50px"/>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <Logo size="xl" />

      <VerticalSpacer height="50px"/>

      <div className={styles.formCard}>
        <h1 className={styles.title}>Log In</h1>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label>Email address</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </div>

          <div className={styles.forgotPassword}>
            <a href="/forgot-password">Forgot password?</a>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          {/* <div className={styles.orDivider}>
            <span>or</span>
          </div> */}
        </form>

        <div className={styles.switchAuthMode}>
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Your Account"
      >
        <p className={styles.infoText}>
          We've sent a confirmation code to your email. Please enter it below to
          verify your account.
        </p>

        <form onSubmit={handleConfirmation}>
          <div className={styles.formGroup}>
            <label>Confirmation Code:</label>
            <input
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter code from email"
            />
          </div>

          {confirmError && (
            <div className={styles.errorMessage}>{confirmError}</div>
          )}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? "Confirming..." : "Confirm Account"}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
}