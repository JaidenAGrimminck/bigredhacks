/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
            source: '/api/:path*',
            destination: 'http://localhost:3001/:path*', // Express @ :3001
            },
        ];
    },
};

export default nextConfig;
