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
  signInWithRedirect,
} from "aws-amplify/auth";
import { useAmplify } from "../context/Providers";
import Modal from "../../components/Modal";
import styles from "./signup.module.css";
import Logo from "@/components/Logo";
import VerticalSpacer from "@/components/VerticalSpacer";
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

  // Handler for Google Sign In/Sign Up
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Using signInWithRedirect for Google OAuth
      await signInWithRedirect({
        provider: "Google",
        options: {
          // This forces Google to show the account picker every time
          prompt: "select_account",
          redirectSignIn: [
            "http://localhost:3000/auth-callback",
            "https://gcsesimulator.co.uk/auth-callback",
          ],
        },
      });
      // Code below won't execute immediately due to redirect
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(
        err.message || "Failed to sign in with Google. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Handler for Apple Sign In/Sign Up
  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Using signInWithRedirect for Apple OAuth
      await signInWithRedirect({
        provider: "Apple",
        options: {
          redirectSignIn: [
            "http://localhost:3000/auth-callback",
            "https://gcsesimulator.co.uk/auth-callback",
          ],
        },
      });
      // Code below won't execute immediately due to redirect
    } catch (err) {
      console.error("Apple sign-in error:", err);
      setError(
        err.message || "Failed to sign in with Apple. Please try again."
      );
      setIsLoading(false);
    }
  };

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
          router.push("/dashboard/overview");
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
  }, [checkAuthState, router, authCheckComplete]); // Added dependencies

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
          router.push("/dashboard/overview");
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
            router.push("/dashboard/overview");
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
        <div className={styles.backgroundAnimation}>
          <div className={styles.gradientBlur}></div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.gradientBlur}></div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.logoSection}>
          <Logo size="large" invert={true} />
        </div>

        <h2 className={styles.title}>Create Account</h2>

        <form onSubmit={handleSignUp}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="fullName">Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your full name"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your email"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Create a password"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Confirm your password"
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            className={styles.signupButton}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className={styles.separator}>
            <span>or continue with</span>
          </div>

          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className={styles.googleIcon}
              >
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Google
            </button>

            {/* Uncomment when Apple sign-in is ready
            <button 
              type="button" 
              className={styles.appleButton} 
              onClick={handleAppleSignIn}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" className={styles.appleIcon}>
                <path
                  fill="currentColor"
                  d="M17.543,12.673c-0.01-1.099,0.481-2.022,1.474-2.658c-0.566-0.808-1.425-1.276-2.568-1.404c-1.071-0.122-2.243,0.634-2.663,0.634  c-0.445,0-1.487-0.596-2.322-0.596c-1.746,0.042-3.387,1.446-3.387,3.621c0,1.061,0.283,2.167,0.847,3.258  c0.74,1.424,1.699,3.014,2.966,3.014c0.714,0,1.241-0.465,2.165-0.465c0.891,0,1.364,0.465,2.177,0.465  c1.258,0,2.195-1.527,2.891-2.962C17.788,14.553,17.544,13.632,17.543,12.673z M15.009,7.082  c0.681-0.842,1.008-1.621,1.008-2.811c-1.011,0.061-1.761,0.661-2.282,1.403c-0.676,0.816-1.036,1.618-1.022,2.742  C13.875,8.456,14.482,7.835,15.009,7.082z"
                />
              </svg>
              Apple
            </button>
            */}
          </div>

          <p className={styles.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <div className={styles.loginLink}>
          <p>
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>
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
