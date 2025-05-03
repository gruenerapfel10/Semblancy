"use client";
// File: app/confirm-account/page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmSignUp } from "aws-amplify/auth";
import Link from "next/link";

export default function ConfirmAccount() {
  const [username, setUsername] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get username from URL query parameter if available
    const params = new URLSearchParams(window.location.search);
    const usernameParam = params.get("username");
    if (usernameParam) {
      setUsername(usernameParam);
    }
  }, []);

  const handleConfirmation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!username) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    if (!confirmationCode) {
      setError("Confirmation code is required");
      setIsLoading(false);
      return;
    }

    try {
      // Confirm the sign up
      const result = await confirmSignUp({
        username,
        confirmationCode,
      });

      console.log("Confirmation result:", result);

      if (result.isSignUpComplete) {
        setSuccess("Account confirmed successfully! You can now log in.");

        // Redirect to login page after short delay
        setTimeout(() => {
          router.push("/login?username=" + encodeURIComponent(username));
        }, 2000);
      } else {
        setError("Confirmation was not completed. Please try again.");
      }
    } catch (err) {
      console.error("Confirmation error:", err);

      if (err.name === "CodeMismatchException") {
        setError("Invalid confirmation code. Please check and try again.");
      } else if (err.name === "ExpiredCodeException") {
        setError("Confirmation code has expired. Please request a new one.");
      } else {
        setError(err.message || "Error confirming account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "2rem auto",
        padding: "2rem",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        backgroundColor: "white",
      }}
    >
      <h2 style={{ marginBottom: "1.5rem" }}>Confirm Your Account</h2>

      <form onSubmit={handleConfirmation}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Username:</label>
          <br />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.5rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label>Confirmation Code:</label>
          <br />
          <input
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter code from email"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "0.5rem",
            }}
          />
          <small
            style={{ color: "#666", display: "block", marginTop: "0.5rem" }}
          >
            Check your email for a confirmation code sent when you signed up
          </small>
        </div>

        {error && (
          <p
            style={{
              color: "red",
              backgroundColor: "#ffeeee",
              padding: "0.5rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}

        {success && (
          <p
            style={{
              color: "green",
              backgroundColor: "#eeffee",
              padding: "0.5rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: "#2873ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "0.75rem 1rem",
            width: "100%",
            fontWeight: "bold",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Confirming..." : "Confirm Account"}
        </button>
      </form>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Link
          href="/login"
          style={{ color: "#2873ff", textDecoration: "none" }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
