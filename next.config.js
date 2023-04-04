/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['media.discordapp.com', 'media.discordapp.net', 'cdn.discordapp.com', 'cdn.discordapp.net']
  },
  reactStrictMode: false,
}

module.exports = nextConfig
