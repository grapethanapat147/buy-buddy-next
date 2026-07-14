import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com", "localhost:3200"],
    },
  },
};

export default nextConfig;
