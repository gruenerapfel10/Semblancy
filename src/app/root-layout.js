// File: src/app/root-layout.js
import { Roboto } from "next/font/google";
import "./globals.css";
import "./variables.css";

// Initialize the Roboto font with desired weights
const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata = {
  title: "Prosemble | Precision Science",
  description:
    "Transforming cancer care with cutting-edge nanoparticle and AI technologies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.className}>
      <body>{children}</body>
    </html>
  );
}
