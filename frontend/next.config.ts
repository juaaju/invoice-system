import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy semua request /api kecuali /api/auth ke backend
      {
        source: "/api/:path((?!auth).*)", // regex: jangan rewrite yang diawali "auth"
        destination: "http://localhost:5000/:path*",
      },
    ];
  },
};

export default nextConfig;
