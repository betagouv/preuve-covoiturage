import remarkGfm from 'remark-gfm'
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
  swcMinify: true,
  experimental: {
    // Required:
    appDir: true,
    // serverActions: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
  webpack: (config, { webpack, isServer }) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource"
    });
    
    const envs = {};
    
    Object.keys(process.env).forEach(env => {
      if (env.startsWith('NEXT_PUBLIC_')) {
        envs[env] = process.env[env];
      }
    })
    
    if (!isServer) {
      config.plugins.push(new webpack.DefinePlugin({
        'process.env': JSON.stringify(envs),
      }))
    }

    return config
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})
 
// Merge MDX config with Next.js config
export default withMDX(nextConfig);