import React from "react";
import styles from "./RedirectButton.module.css";
import Link from "next/link";

export default function RedirectButton({
  href = "/",
  text = "CLICK HERE",
  backgroundColor,
  size = "m",
  className = "",
}) {
  const buttonClass = `${styles.redirectButton} ${
    styles[`size${size.toUpperCase()}`]
  }`;

  const buttonStyle = backgroundColor ? { backgroundColor } : {};

  return (
    <button
      href={href}
      className={`${buttonClass}`}
      style={buttonStyle}
    >
      {text}
    </button>
  );
}
