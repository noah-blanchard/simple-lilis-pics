import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Derive the Supabase Storage host from the env var so uploaded images work
// against any project — never hardcode a specific project ref.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

// The CMS moved to its own origin. ADMIN_URL is read at build time (redirects
// are compiled into the routes manifest), so it must be a build argument in
// Docker. Local default = the admin dev server.
const adminUrl = (process.env.ADMIN_URL ?? "http://localhost:3051").replace(
  /\/$/,
  "",
);

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
  async redirects() {
    return [
      {
        source: "/admin/:path*",
        destination: `${adminUrl}/admin/:path*`,
        permanent: false,
      },
      { source: "/login", destination: `${adminUrl}/login`, permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
