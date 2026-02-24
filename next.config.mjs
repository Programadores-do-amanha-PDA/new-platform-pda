/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "15mb",
        },
    },
    serverExternalPackages: ["pino", "pino-pretty"],
    allowedDevOrigins: ["192.168.0.108", "_next/*"],
};

export default nextConfig;
