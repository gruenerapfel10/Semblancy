"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, confirmSignUp, signInWithRedirect } from "aws-amplify/auth";
import { useAmplify } from "../Providers";
import Modal from "../../components/Modal";
import styles from "./login.module.css";
import Image from "next/image";
import Logo from "@/components/Logo";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { checkAuthState } = useAmplify();

  useEffect(() => {
    if (authCheckComplete) return;

    const checkAuth = async () => {
      try {
        const isSignedIn = await checkAuthState();
        
        if (isSignedIn) {
          console.log("User already authenticated, redirecting to dashboard");
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setAuthCheckComplete(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();

    const params = new URLSearchParams(window.location.search);
    const usernameParam = params.get("username");
    if (usernameParam) {
      setUsername(usernameParam);
    }

    if (params.get("signupSuccess")) {
      setSuccessMessage("Account created successfully! Please log in.");
    }

    if (params.get("confirmSuccess")) {
      setSuccessMessage("Account confirmed successfully! Please log in.");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const signInResult = await signIn({ username, password });
      console.log("Sign in successful:", signInResult);

      if (
        signInResult.nextStep &&
        signInResult.nextStep.signInStep !== "DONE"
      ) {
        console.log("Additional steps required:", signInResult.nextStep);

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

      await checkAuthState();
      sessionStorage.setItem("justLoggedIn", "true");
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // In Gen 2, we use a different format - the provider needs to be in lowercase
      await signInWithRedirect({ 
        provider: 'Google'  // lowercase is required in Gen 2
      });
      // Code below won't execute immediately due to redirect
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // In Gen 2, we use a different format - the provider needs to be in lowercase
      await signInWithRedirect({ 
        provider: 'Apple'  // lowercase is required in Gen 2
      });
      // Code below won't execute immediately due to redirect
    } catch (err) {
      console.error("Apple sign-in error:", err);
      setError(err.message || "Failed to sign in with Apple. Please try again.");
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

  if (isLoading && !authCheckComplete) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.splitContainer}>
      {/* Left side with hero image */}
      <div className={styles.heroSide}>
        <div className={styles.logoContainer}>
          <Logo size="large" invert={true}/>
          <a href="/" className={styles.backToWebsite}>Back to website</a>
        </div>
        <div className={styles.heroContent}>
          <h2 className={styles.heroSlogan}>The most efficient way<br/>to revise GCSE & A Levels</h2>
          <p className={styles.heroSubtitle}>Analyze. Predict. Transform.</p>
          <div className={styles.moleculeAnimation}>
            <div className={styles.molecule}></div>
          </div>
          <div className={styles.heroIndicators}>
            <span className={styles.indicator}></span>
            <span className={styles.indicator}></span>
            <span className={styles.indicator + ' ' + styles.activeIndicator}></span>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.formSubtitle}>Sign in to access your biochemical data analysis</p>
          <p className={styles.signupLink}>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>

          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Email"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Password"
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <a href="/forgot-password">Forgot password?</a>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>

            <div className={styles.divider}>
              <span>Or log in with</span>
            </div>

            <div className={styles.socialButtons}>
              <button 
                type="button" 
                className={styles.googleButton}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <span className={styles.googleIcon}>G</span>
                Google
              </button>
              <button type="button" className={styles.appleButton} onClick={handleAppleSignIn}>
                <span className={styles.appleIcon}>A</span>
                Apple
              </button>
            </div>
          </form>
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

          DEV VERSION TEST.
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
            className={styles.confirmButton}
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