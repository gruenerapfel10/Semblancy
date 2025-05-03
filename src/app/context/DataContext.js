"use client";
import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem("temp-theme"));

  // Check for active session on component mount and listen for auth events
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  // Context value with all exported functions and state
  const value = {
    theme, // need to link with user preferences in the future
  };

  return (
    <AmplifyContext.Provider value={value}>{children}</AmplifyContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useAmplify must be used within an AmplifyProvider");
  }
  return context;
}
