"use client";
// File: app/forgot-password/page.js
import { useState } from "react";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import styles from "../login/login.module.css";
import Logo from "@/components/Logo";
import VerticalSpacer from "@/components/VerticalSpacer";
import Modal from "../../components/Modal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const router = useRouter();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await resetPassword({ username: email });
      setSuccessMessage(
        "Password reset instructions sent to your email address"
      );
      setShowConfirmation(true);
    } catch (err) {
      console.error("Password reset request error:", err);

      if (err.name === "UserNotFoundException") {
        setError("No account found with this email address");
      } else if (err.name === "LimitExceededException") {
        setError("Too many attempts. Please try again later.");
      } else if (err.name === "NetworkError") {
        setError("Network error. Please check your connection.");
      } else {
        setError(
          err.message || "Error requesting password reset. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setConfirmError("");

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      });

      setSuccessMessage("Password reset successful!");
      setShowConfirmation(false);

      // Redirect to login page with success message
      router.push(`/login?passwordReset=true`);
    } catch (err) {
      console.error("Confirm reset error:", err);

      if (err.name === "CodeMismatchException") {
        setConfirmError("Invalid code. Please try again.");
      } else if (err.name === "ExpiredCodeException") {
        setConfirmError("Code has expired. Please request a new one.");
      } else if (err.name === "InvalidPasswordException") {
        setConfirmError(
          "Password does not meet requirements. Please use a stronger password."
        );
      } else if (err.name === "NetworkError") {
        setConfirmError("Network error. Please check your connection.");
      } else {
        setConfirmError(
          err.message || "Error confirming password reset. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Logo size="xl" />

      <VerticalSpacer height="50px" />

      <div className={styles.formCard}>
        <h1 className={styles.title}>Reset Password</h1>

        {successMessage && !showConfirmation && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <form onSubmit={handleResetRequest}>
          <div className={styles.formGroup}>
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Reset Password"}
          </button>

          <div className={styles.switchAuthMode}>
            <a href="/login">Back to login</a>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Set New Password"
      >
        <p className={styles.infoText}>
          We've sent a confirmation code to your email. Enter the code and your
          new password below.
        </p>

        <form onSubmit={handleConfirmReset}>
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

          <div className={styles.formGroup}>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter new password"
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
            {isLoading ? "Confirming..." : "Confirm New Password"}
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
