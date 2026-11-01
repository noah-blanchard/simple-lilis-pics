import type { NextConfig } from "next";

// Derive the Supabase Storage host from the env var so uploaded images work
// against any project — never hardcode a specific project ref.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // Standalone output is for Docker builds only (the Dockerfiles set
  // NEXT_OUTPUT=standalone). Locally on Windows the traced node_modules
  // symlinks cannot be read back, so regular builds stay unchanged.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  transpilePackages: ["@lili/core", "@lili/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  // The CMS keeps its historical /admin/* paths; the bare origin opens it.
  async redirects() {
    return [{ source: "/", destination: "/admin", permanent: false }];
  },
};

export default nextConfig;
