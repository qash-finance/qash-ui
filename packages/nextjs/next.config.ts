import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: config => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
  transpilePackages: ["@getpara/web-sdk", "@getpara/react-sdk", "miden-para", "miden-para-react"],
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Cross-Origin-Embedder-Policy",
  //           value: "require-corp",
  //         },
  //         {
  //           key: "Cross-Origin-Opener-Policy",
  //           value: "same-origin",
  //         },
  //       ],
  //     },
  //   ];
  // },
  output: "standalone",
};

export default nextConfig;
