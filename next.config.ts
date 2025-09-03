import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Handle Konva canvas issues in client-side builds
    if (!isServer) {
      // Configure fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        buffer: false,
        util: false,
        assert: false,
        url: false,
        path: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        os: false,
        crypto: false,
        vm: false,
        querystring: false,
      };
      
      // Exclude Konva's server-side modules
      config.resolve.alias = {
        ...config.resolve.alias,
        'konva/lib/index-node': false,
        'konva/lib/index-node.js': false,
      };

      // Add plugin to ignore specific modules
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(canvas|jsdom|fs)$/,
        })
      );

      // Configure externals
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('canvas');
      }
    }
    
    // Add alias for easier imports
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    
    return config;
  },
  
  // Ensure proper transpilation
  transpilePackages: ['konva', 'react-konva'],

  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
