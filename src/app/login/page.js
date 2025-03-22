"use client";
import React, { useState, useEffect } from "react";
import { useAmplify } from "../context/Providers";
import { signInWithRedirect } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStatus, setResetStatus] = useState({ step: "initial" });

  const {
    checkAuthState,
    isAuthenticated,
    initiatePasswordReset,
    completePasswordReset,
  } = useAmplify();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await checkAuthState();
      if (isAuth) {
        router.push("/dashboard/overview");
      }
    };

    checkAuth();
  }, [router, isAuthenticated]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setIsSigningIn(true);
      setError("");

      const { signIn } = await import("aws-amplify/auth");
      await signIn({ username: email, password });

      // Dispatch event to notify navbar of auth state change
      window.dispatchEvent(new Event("authStateChange"));

      // If sign-in is successful, redirect to dashboard
      router.push("/dashboard/overview");
    } catch (err) {
      console.error("Error signing in:", err);
      setError(
        err.message || "Failed to sign in. Please check your credentials."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      // Add prompt parameter to force account selection
      await signInWithRedirect({
        provider: "Google",
        options: {
          // This forces Google to show the account picker every time
          prompt: "select_account",
        },
      });
    } catch (error) {
      console.error("Error with Google sign-in:", error);
      setError(error.message || "Google sign-in failed");
      setIsSigningIn(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithRedirect({ provider: "Apple" });
    } catch (error) {
      console.error("Error with Apple sign-in:", error);
      setError(error.message || "Apple sign-in failed");
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      const result = await initiatePasswordReset(email);

      if (result.success) {
        setResetStatus({
          step: "code_sent",
          delivery: result.delivery,
        });
        setIsResetPassword(true);
      } else {
        setError(result.message || "Failed to initiate password reset");
      }
    } catch (error) {
      console.error("Error initiating password reset:", error);
      setError(error.message || "Failed to initiate password reset");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetCode || !newPassword) {
      setError("Please enter both verification code and new password");
      return;
    }

    try {
      const result = await completePasswordReset(email, resetCode, newPassword);

      if (result.success) {
        setResetStatus({ step: "success" });
        // Reset form after a delay
        setTimeout(() => {
          setIsResetPassword(false);
          setResetStatus({ step: "initial" });
          setResetCode("");
          setNewPassword("");
        }, 3000);
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error completing password reset:", error);
      setError(error.message || "Failed to reset password");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.gradientBlur}></div>
      </div>

      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <Logo size="large" invert={true} />
        </div>

        {!isResetPassword ? (
          <div className={styles.formSection}>
            <h2>Sign In</h2>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleEmailSignIn}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.signInButton}
                disabled={isSigningIn}
              >
                {isSigningIn ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className={styles.forgotPassword}>
              <button onClick={handleForgotPassword} disabled={isSigningIn}>
                Forgot Password?
              </button>
            </div>

            <div className={styles.separator}>
              <span>or continue with</span>
            </div>

            <div className={styles.socialButtons}>
              <button
                onClick={handleGoogleSignIn}
                className={styles.googleButton}
                disabled={isSigningIn}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Google
              </button>

              {/* <button 
                onClick={handleAppleSignIn} 
                className={styles.appleButton}
                disabled={isSigningIn}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M17.543,12.673c-0.01-1.099,0.481-2.022,1.474-2.658c-0.566-0.808-1.425-1.276-2.568-1.404c-1.071-0.122-2.243,0.634-2.663,0.634  c-0.445,0-1.487-0.596-2.322-0.596c-1.746,0.042-3.387,1.446-3.387,3.621c0,1.061,0.283,2.167,0.847,3.258  c0.74,1.424,1.699,3.014,2.966,3.014c0.714,0,1.241-0.465,2.165-0.465c0.891,0,1.364,0.465,2.177,0.465  c1.258,0,2.195-1.527,2.891-2.962C17.788,14.553,17.544,13.632,17.543,12.673z M15.009,7.082  c0.681-0.842,1.008-1.621,1.008-2.811c-1.011,0.061-1.761,0.661-2.282,1.403c-0.676,0.816-1.036,1.618-1.022,2.742  C13.875,8.456,14.482,7.835,15.009,7.082z"
                  />
                </svg>
                Apple
              </button> */}
            </div>

            <div className={styles.signupLink}>
              <p>
                Don't have an account? <a href="/signup">Sign Up</a>
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.formSection}>
            <h2>Reset Password</h2>

            {error && <div className={styles.errorMessage}>{error}</div>}

            {resetStatus.step === "code_sent" && (
              <div className={styles.successMessage}>
                Verification code sent to{" "}
                {resetStatus.delivery?.destination || "your email"}
              </div>
            )}

            {resetStatus.step === "success" && (
              <div className={styles.successMessage}>
                Password successfully reset! You can now sign in with your new
                password.
              </div>
            )}

            {resetStatus.step !== "success" && (
              <form onSubmit={handleResetPassword}>
                <div className={styles.inputGroup}>
                  <label htmlFor="reset-email">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={resetStatus.step === "code_sent"}
                    required
                  />
                </div>

                {resetStatus.step === "initial" ? (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={styles.signInButton}
                  >
                    Send Verification Code
                  </button>
                ) : (
                  <>
                    <div className={styles.inputGroup}>
                      <label htmlFor="reset-code">Verification Code</label>
                      <input
                        id="reset-code"
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter verification code"
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="new-password">New Password</label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <button type="submit" className={styles.signInButton}>
                      Reset Password
                    </button>
                  </>
                )}
              </form>
            )}

            <div className={styles.backToLogin}>
              <button
                onClick={() => {
                  setIsResetPassword(false);
                  setResetStatus({ step: "initial" });
                  setError("");
                }}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
