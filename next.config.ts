import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Aapke project ko isi loader ki zarurat hai, is liye rakha hai.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Doctor photos Convex storage se aati hain.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "https", hostname: "**.convex.site" },
    ],
  },
};

export default nextConfig;