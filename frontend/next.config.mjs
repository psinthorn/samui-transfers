/** @type {import('next').NextConfig} */
const nextConfig = {
	// Ensure server-side only packages like pdfkit are not bundled into
	// Next's server build so their internal data files (e.g. AFM fonts)
	// can be resolved from node_modules at runtime.
	serverExternalPackages: ["pdfkit", "fontkit"],
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
};

export default nextConfig;
