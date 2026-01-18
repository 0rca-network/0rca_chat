import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ['@privy-io/react-auth', 'ai', 'zod', '@ai-sdk/mistral', '@kyuso/crogas'],
};

export default nextConfig;
