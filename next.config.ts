import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	cacheOnFrontEndNav: true,
	aggressiveFrontEndNavCaching: true,
	reloadOnOnline: true,
	disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
	turbopack: {},
	experimental: {
		viewTransition: true,
	},
	images: {
		unoptimized: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default withPWA(nextConfig);
