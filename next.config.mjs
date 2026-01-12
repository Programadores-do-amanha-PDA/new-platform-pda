/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "15mb",
        },
    },
    serverExternalPackages: ["pino", "pino-pretty"],
};

export default nextConfig;
