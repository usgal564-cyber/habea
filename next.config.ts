import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-4a713791-e90b-4e8f-acfd-aed349cc21e5.space-z.ai",
    "space-z.ai",
    "127.0.0.1",
    "localhost",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
