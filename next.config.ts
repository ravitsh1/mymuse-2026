import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // proxy.ts strips trailing slashes itself, so old-site URLs (/portfolio/x/) redirect in one hop
  skipTrailingSlashRedirect: true,
  // every response off the real domain (vercel.app, previews) says noindex — the old site keeps ranking until launch
  async headers() {
    return [
      {
        source: '/:path*',
        missing: [{ type: 'host', value: '(www\\.)?mymuse\\.co\\.il' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    // production media live on the Vercel Blob CDN
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
