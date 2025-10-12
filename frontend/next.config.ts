import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    async rewrites() {
      return [
        {
          source: "/api/sheets/:path*",
          destination: "https://invoice-system-copy-production.up.railway.app/sheets/:path*",
        },
      ];
    },
  };

export default nextConfig;
