// src/utils/securityUtils.js

/**
 * Utilities for handling security aspects of the forum system
 */

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (!input) return "";

  // Sanitize to prevent XSS
  const sanitized = input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return sanitized;
};

// Validate content for forum posts
export const validateForumContent = (content) => {
  // Trim content and check if it's empty
  if (!content.trim()) {
    return {
      valid: false,
      message: "Content cannot be empty",
    };
  }

  // Check for minimum length
  if (content.trim().length < 5) {
    return {
      valid: false,
      message: "Content is too short (minimum 5 characters)",
    };
  }

  // Check for maximum length
  if (content.length > 10000) {
    return {
      valid: false,
      message: "Content is too long (maximum 10,000 characters)",
    };
  }

  return { valid: true };
};

// Check for prohibited content
export const moderateContent = (content) => {
  // This is a simple placeholder. In a real-world scenario,
  // you might use a more sophisticated content moderation service

  // List of prohibited words (demo only, should be extended)
  const prohibitedWords = ["badword1", "badword2", "badword3"];

  // Check for prohibited words
  const lowerContent = content.toLowerCase();
  for (const word of prohibitedWords) {
    if (lowerContent.includes(word.toLowerCase())) {
      return {
        approved: false,
        message: "Content contains prohibited language",
      };
    }
  }

  return { approved: true };
};

// Check user permissions
export const checkPermissions = (user, requiredPermission) => {
  if (!user) {
    return {
      hasPermission: false,
      message: "Authentication required",
    };
  }

  // Check if user is admin
  if (user.groups && user.groups.includes("Admins")) {
    return { hasPermission: true }; // Admins have all permissions
  }

  // Check if user is moderator and the permission is for moderation
  if (
    user.groups &&
    user.groups.includes("Moderators") &&
    ["moderate", "lock", "sticky", "flag_review"].includes(requiredPermission)
  ) {
    return { hasPermission: true };
  }

  // Check for standard user permissions
  if (["create_topic", "create_reply", "view"].includes(requiredPermission)) {
    return { hasPermission: true }; // Standard permissions for authenticated users
  }

  // Check if user is the content owner (requires contentOwnerId parameter)
  if (requiredPermission === "edit_own" && user.userId === arguments[2]) {
    return { hasPermission: true };
  }

  return {
    hasPermission: false,
    message: "You do not have permission to perform this action",
  };
};

// Simple encrypt/decrypt for client-side data (minimal security, just to obscure data)
// DO NOT use for sensitive information
export const obscureData = (data) => {
  if (!data) return "";
  const encoded = btoa(JSON.stringify(data));
  return encoded;
};

export const unobscureData = (encoded) => {
  if (!encoded) return null;
  try {
    const data = JSON.parse(atob(encoded));
    return data;
  } catch (error) {
    console.error("Error unobscuring data:", error);
    return null;
  }
};
