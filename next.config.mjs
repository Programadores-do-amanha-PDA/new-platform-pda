/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "15mb",
        },
        instrumentationHook: true,
        serverComponentsExternalPackages: ["pino", "pino-pretty"],
    },
};

export default nextConfig;
