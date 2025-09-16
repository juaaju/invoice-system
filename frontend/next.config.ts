import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    async rewrites() {
      return [
        {
          source: "/api/sheets/:path*",
          destination: "http://localhost:5000/sheets/:path*",
        },
      ];
    },
  };

export default nextConfig;
