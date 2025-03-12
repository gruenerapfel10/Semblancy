"use client";
// File: app/signup/page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signUp,
  confirmSignUp,
  signIn,
  autoSignIn,
  fetchAuthSession,
} from "aws-amplify/auth";
import { useAmplify } from "../Providers";
import Modal from "../../components/Modal";
import styles from "./signup.module.css";
import Image from "next/image";
import Logo from "@/components/Logo";
import VerticalSpacer from "@/components/VerticalSpacer";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const router = useRouter();
  const { checkAuthState, amplifyConfig } = useAmplify();

  // Check for existing authentication on component mount
  useEffect(() => {
    // Prevent checking auth multiple times
    if (authCheckComplete) return;
    
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
  }, []); // Empty dependency array to run only once

  const validateFullName = (name) => {
    // This regex matches only letters from any language script and spaces
    const nameRegex = /^[\p{L}\s]+$/u;
    return nameRegex.test(name);
  };

  const validatePassword = (password) => {
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password cannot begin or end with spaces.";
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    // Check for at least one symbol
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      return "Password must contain at least one symbol character (e.g., !@#$%^&*).";
    }

    return null; // No error
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate that full name contains only letters and spaces
    if (!validateFullName(fullName)) {
      setError("Name can only contain letters and spaces.");
      setIsLoading(false);
      return;
    }

    // Generate username using sanitized fullName (replacing spaces with dots)
    const sanitizedFullName = fullName.replace(/\s+/g, ".");
    const generatedUsername = `${sanitizedFullName}-${uuidv4()}`;
    setUsername(generatedUsername);

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Validate password requirements
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      // Use generated username in Cognito
      const result = await signUp({
        username: generatedUsername,
        password,
        options: {
          userAttributes: {
            email: email,
            name: fullName || email.split("@")[0], // Use full name or part before @ as display name
          },
          autoSignIn: true,
        },
      });
      if (result.isSignUpComplete) {
        // If automatic confirmation (e.g., through admin settings)
        try {
          // Update auth state
          await checkAuthState();

          // Set the "just logged in" flag like in login page
          sessionStorage.setItem("justLoggedIn", "true");

          // Redirect to dashboard or home after successful auto sign-in
          router.push("/dashboard");
        } catch (signInErr) {
          console.error("Auto sign-in error:", signInErr);
          // Fall back to regular login if auto sign-in fails
          router.push(
            "/login?username=" +
              encodeURIComponent(email) +
              "&signupSuccess=true"
          );
        }
      } else {
        // Need manual confirmation (most common case)
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error("Signup error:", err);

      if (err.name === "UsernameExistsException") {
        setError(
          "An account with this email already exists. Please log in instead."
        );
      } else if (err.message.includes("password")) {
        // Check for specific regex pattern error
        if (
          err.message.includes("regular expression pattern: ^[\\S]+.*[\\S]+$")
        ) {
          setError("Password cannot begin or end with whitespace characters.");
        } else if (err.message.includes("StringLengthValidator")) {
          setError("Password must be at least 8 characters long.");
        } else if (
          err.message.includes("InvalidPasswordException") ||
          err.name === "InvalidPasswordException"
        ) {
          if (err.message.includes("symbol characters")) {
            setError(
              "Password must contain at least one symbol character (e.g., !@#$%^&*)."
            );
          } else if (err.message.includes("uppercase characters")) {
            setError("Password must contain at least one uppercase letter.");
          } else if (err.message.includes("numeric characters")) {
            setError("Password must contain at least one number.");
          } else {
            setError(
              err.message ||
                "Password must meet all requirements: length, uppercase, numbers, and symbols."
            );
          }
        } else {
          setError(
            "Password error: Please ensure your password meets the requirements."
          );
        }
      } else if (
        err.name === "InvalidParameterException" &&
        err.message.includes("Username")
      ) {
        setError("Invalid email format. Please use a valid email address.");
      } else {
        setError(err.message || "Error signing up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to resend confirmation code
  const handleResendCode = async () => {
    setIsLoading(true);
    setConfirmError("");

    try {
      // Import resendSignUpCode function
      const { resendSignUpCode } = await import("aws-amplify/auth");

      await resendSignUpCode({
        username: username,
      });

      setConfirmError(""); // Clear any errors
      setConfirmationCode(""); // Clear the input field
      alert("A new confirmation code has been sent to your email");
    } catch (err) {
      console.error("Error resending code:", err);
      setConfirmError("Could not resend code: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setConfirmError("");

    try {
      const result = await confirmSignUp({
        username: username,
        confirmationCode,
      });

      if (result.isSignUpComplete) {
        try {
          // Explicitly sign in after confirmation to ensure proper auth state
          const signInResult = await signIn({
            username: username,
            password,
          });

          if (signInResult.isSignedIn) {
            // Make sure auth state is fully updated
            await checkAuthState();
            // Set the flag for dashboard
            sessionStorage.setItem("justLoggedIn", "true");
            router.push("/dashboard");
            return;
          }
        } catch (signInErr) {
          console.error("Sign-in error after confirmation:", signInErr);
          // Fallback to login page
          router.push(
            "/login?username=" +
              encodeURIComponent(username) +
              "&confirmSuccess=true"
          );
        }
      } else {
        setConfirmError("Confirmation failed. Please try again.");
      }
    } catch (err) {
      console.error("Confirmation error:", err);
      
      if (err.name === "CodeMismatchException") {
        setConfirmError("Invalid code. Please try again.");
      } else if (err.name === "ExpiredCodeException") {
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
      <div className={styles.container}>
        <Logo size="xl" />
        <VerticalSpacer height="50px" />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Logo size="xl" />

      <VerticalSpacer height="50px" />

      <div className={styles.formCard}>
        <h1 className={styles.title}>Welcome to Prosemble!</h1>

        <form onSubmit={handleSignUp}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter full name"
              className={styles.input}
            />
          </div>

          {/* <div className={styles.formGroup}>
            <label>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter company name"
              className={styles.input}
            />
          </div> */}

          <div className={styles.formGroup}>
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter email address"
              className={styles.input}
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
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.signupButton}
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign up"}
          </button>

          <p className={styles.termsText}>
            By continuing, you acknowledge that you understand the Terms &
            Conditions and agree to the privacy policy.
          </p>
        </form>

        <p className={styles.loginLink}>
          Already a member? <a href="/login">Login</a>
        </p>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Your Account"
      >
        <p>
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
              className={styles.input}
            />
          </div>

          {confirmError && <p className={styles.error}>{confirmError}</p>}

          <button
            type="submit"
            className={styles.confirmButton}
            disabled={isLoading}
          >
            {isLoading ? "Confirming..." : "Confirm Account"}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleResendCode}
            disabled={isLoading}
          >
            Resend Code
          </button>
        </form>
      </Modal>
    </div>
  );
}