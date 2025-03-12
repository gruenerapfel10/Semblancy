export const extractFullName = (username) => {
  if (!username || !username.includes("-")) return username;
  const parts = username.split("-");
  const namePart = parts[0];
  const nameWithSpaces = namePart.replace(/\./g, " ");
  return nameWithSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
