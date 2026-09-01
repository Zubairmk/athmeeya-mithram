import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // next-pwa's auto-register hooks into the Pages Router's _app.js, which
  // doesn't exist under App Router — register manually instead (see
  // components/ServiceWorkerRegister.tsx).
  register: false,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
