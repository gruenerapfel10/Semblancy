/** @type {import('next').NextConfig} */

// export const metadata = {
//   title: "Your Company Name | Application",
//   description: "Description of your application",
//   keywords: ["keyword1", "keyword2"],
//   authors: [{ name: "Your Company" }],
//   viewport: "width=device-width, initial-scale=1",
//   icons: {
//     icon: [
//       { url: "/favicon.ico" },
//       { url: "/icon.png", type: "image/png", sizes: "32x32" },
//     ],
//     apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
//   },
//   openGraph: {
//     type: "website",
//     url: "https://prosemble.org",
//     title: "ProSemble | Application",
//     description: "Description for social sharing",
//     siteName: "ProSemble",
//     images: [
//       {
//         url: "/og-image.jpg",
//       },
//     ],
//   },
//   // For dynamic titles on individual pages, you can create a specific
//   // metadata.js file in each page directory
// };

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  }
};

export default nextConfig;