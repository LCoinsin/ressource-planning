import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./src/generated/prisma/**/*"],
    },
  },
};

export default nextConfig;
