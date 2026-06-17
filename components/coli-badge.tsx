"use client";

export function ColiBadge() {
	return (
		<a
			href="https://www.coli.com.ar/"
			target="_blank"
			rel="noopener noreferrer"
			className="fixed bottom-20 right-3 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all hover:scale-105 md:bottom-4"
			aria-label="Desarrollado por Colidevs"
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src="https://www.coli.com.ar/colibri-web.png"
				alt="Colidevs"
				className="w-5 h-5 object-contain"
			/>
			<span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
				by <span className="font-bold text-gray-800 dark:text-gray-200">colidevs.</span>
			</span>
		</a>
	);
}
