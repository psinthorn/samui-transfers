/** @type {import('next').NextConfig} */
const nextConfig = {
	// Ensure server-side only packages like pdfkit are not bundled into
	// Next's server build so their internal data files (e.g. AFM fonts)
	// can be resolved from node_modules at runtime.
	serverExternalPackages: ["pdfkit", "fontkit"],
	
	// Image Optimization Configuration for Performance
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
			},
		],
		// Enable AVIF format for smaller image sizes (20-30% smaller than WebP)
		formats: ['image/avif', 'image/webp'],
		// Cache optimized images for 365 days (1 year)
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// Minimize cumulative layout shift with sized images
		minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
		// Enable dangerouslyAllowSVG and other optimizations
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	
	webpack: (config, { isServer }) => {
		// Workaround: next-auth@5 imports 'next/server' but Next 15 canary exports 'next/server.js'
		config.resolve = config.resolve || {}
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"next/server": "next/server.js",
		}
		if (isServer) {
			// Double-ensure pdfkit remains external in the Node.js bundle.
			// This avoids missing asset lookups like data/Helvetica.afm.
			const externals = config.externals || [];
			externals.push("pdfkit", "fontkit");
			config.externals = externals;
		}
		return config;
	},
	
	// Optimize production builds
	compress: true,
};

export default nextConfig;
