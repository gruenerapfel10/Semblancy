"use client";
import { useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { useRouter } from "next/navigation";
import { useAmplify } from "@/context/AmplifyProvider";

export default function AuthCallback() {
  const [status, setStatus] = useState("Processing authentication...");
  const router = useRouter();
  const { checkAuthState } = useAmplify();

  useEffect(() => {
    // Listen for auth events
    const handleAuthEvents = ({ payload }) => {
      console.log("Auth event:", payload.event);
      
      if (payload.event === "signedIn") {
        setStatus("Sign in successful! Redirecting...");
        handleSuccess();
      } else if (payload.event === "signIn_failure") {
        setStatus("Sign in failed: " + (payload.data?.message || "Unknown error"));
      }
    };

    const authListener = Hub.listen("auth", handleAuthEvents);

    // Check current auth state
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthState();
        if (isAuthenticated) {
          setStatus("Already authenticated! Redirecting...");
          handleSuccess();
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        setStatus("Authentication error. Please try again.");
      }
    };

    checkAuth();

    // Cleanup listener on component unmount
    return () => {
      authListener();
    };
  }, []);

  const handleSuccess = () => {
    // Redirect to dashboard after successful authentication
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        
        <div className="flex justify-center mb-4">
          {status.includes("successful") ? (
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : status.includes("failed") || status.includes("error") ? (
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          )}
        </div>
        
        <p className="text-gray-700">{status}</p>
        
        {(status.includes("failed") || status.includes("error")) && (
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}