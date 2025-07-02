// client/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Allow external host access (like Render.com)
  devIndicators: {
    buildActivity: false,
  },
  // ✅ Add this:
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
      ],
    },
  ],
  // ✅ Important: Disable host checking for deployment
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

export default nextConfig
