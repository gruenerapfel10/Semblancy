"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUp, confirmSignUp, signIn } from "aws-amplify/auth";
import { useAmplify } from "../Providers";
import Modal from "../../components/Modal";
import styles from "./signup.module.css";
import Image from "next/image";
import Logo from "@/components/Logo";
import { v4 as uuidv4 } from "uuid";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const router = useRouter();
  const { checkAuthState } = useAmplify();

  // Check for existing authentication on component mount
  useEffect(() => {
    if (authCheckComplete) return;
    
    const checkAuth = async () => {
      try {
        const isSignedIn = await checkAuthState();
        if (isSignedIn) {
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
  }, []);

  const validateName = (name) => {
    const nameRegex = /^[\p{L}\s]+$/u;
    return nameRegex.test(name);
  };

  const validatePassword = (password) => {
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      return "Password must contain at least one symbol character.";
    }

    return null;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      setError("You must agree to the Terms & Conditions to continue.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    const fullName = `${firstName} ${lastName}`.trim();
    
    if (!validateName(fullName)) {
      setError("Name can only contain letters and spaces.");
      setIsLoading(false);
      return;
    }

    const generatedUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}-${uuidv4()}`;
    setUsername(generatedUsername);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp({
        username: generatedUsername,
        password,
        options: {
          userAttributes: {
            email: email,
            name: fullName
          },
          autoSignIn: true,
        },
      });
      
      if (result.isSignUpComplete) {
        try {
          await checkAuthState();
          sessionStorage.setItem("justLoggedIn", "true");
          router.push("/dashboard");
        } catch (signInErr) {
          console.error("Auto sign-in error:", signInErr);
          router.push(
            "/login?username=" +
              encodeURIComponent(email) +
              "&signupSuccess=true"
          );
        }
      } else {
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error("Signup error:", err);

      if (err.name === "UsernameExistsException") {
        setError(
          "An account with this email already exists. Please log in instead."
        );
      } else if (err.message.includes("password")) {
        setError(
          "Password error: Please ensure your password meets all requirements."
        );
      } else {
        setError(err.message || "Error signing up");
      }
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
          const signInResult = await signIn({
            username: username,
            password,
          });

          if (signInResult.isSignedIn) {
            await checkAuthState();
            sessionStorage.setItem("justLoggedIn", "true");
            router.push("/dashboard");
            return;
          }
        } catch (signInErr) {
          console.error("Sign-in error after confirmation:", signInErr);
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
      } else {
        setConfirmError(err.message || "Error confirming account");
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
      const { resendSignUpCode } = await import("aws-amplify/auth");
      await resendSignUpCode({
        username: username,
      });
      alert("A new confirmation code has been sent to your email");
    } catch (err) {
      console.error("Error resending code:", err);
      setConfirmError("Could not resend code: " + err.message);
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
          <Logo size="large" invert={true} />
          <a href="/" className={styles.backToWebsite}>Back to website</a>
        </div>
        <div className={styles.heroContent}>
          <h2 className={styles.heroSlogan}>Reimagining Biochemical<br />Research with AI</h2>
          <p className={styles.heroSubtitle}>Analyze. Predict. Transform.</p>
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
          <h1 className={styles.title}>Join Prosemble</h1>
          <p className={styles.formSubtitle}>Create your account to start analyzing biochemical data</p>
          <p className={styles.loginLink}>
            Already have an account? <a href="/login">Log in</a>
          </p>

          <form onSubmit={handleSignUp}>
            <div className={styles.nameFields}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="First name"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Last name"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Enter your password"
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

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="terms" className={styles.checkboxLabel}>
                I agree to the <a href="/terms" className={styles.termsLink}>Terms & Conditions</a>
              </label>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.signupButton}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            <div className={styles.divider}>
              <span>Or register with</span>
            </div>

            <div className={styles.socialButtons}>
              <button type="button" className={styles.googleButton}>
                <span className={styles.googleIcon}>G</span>
                Google
              </button>
              <button type="button" className={styles.appleButton}>
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