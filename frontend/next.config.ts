import type { NextConfig } from "next";
import path from "node:path";

const useStandalone = process.env.NEXT_OUTPUT_STANDALONE === "true";

const nextConfig: NextConfig = {
  output: useStandalone ? "standalone" : undefined,
  outputFileTracingRoot: useStandalone ? path.join(__dirname, "..") : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
