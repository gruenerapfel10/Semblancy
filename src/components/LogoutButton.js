"use client";
import { useState } from "react";
import { useAmplify } from "../app/Providers";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className, children }) {
  const { signOut } = useAmplify();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    
    try {
      console.log("Logging out user...");
      
      // Use the signOut from the Amplify provider which handles global signout
      // This works for both Cognito and federated (Google, Apple) logins
      await signOut();
      window.dispatchEvent(new Event('authStateChange'));
      
      // The router.push to login page is handled inside the signOut function in the provider
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during sign out:", error);
      // Force redirect even if there was an error
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className={className || ""}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Logging out..." : (
        children || (
          <>
            Logout
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </>
        )
      )}
    </button>
  );
}