const isMobileTarget = process.env.NEXT_PUBLIC_APP_TARGET === "mobile";

/** @type {import('next').NextConfig} */
const nextConfig = isMobileTarget
  ? {
      reactStrictMode: true,
      output: "export",
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
    }
  : {
      reactStrictMode: true,
      output: "standalone",
      async headers() {
        return [
          {
            source: "/(.*)",
            headers: [
              { key: "X-Frame-Options", value: "SAMEORIGIN" },
              { key: "X-Content-Type-Options", value: "nosniff" },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
            ],
          },
        ];
      },
    };

module.exports = nextConfig;
