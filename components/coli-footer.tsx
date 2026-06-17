export function ColiFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-3 px-6">
			<a
				href="https://www.coli.com.ar/"
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center justify-center gap-2 group"
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src="https://www.coli.com.ar/colibri-web.png" alt="Colidevs" className="w-4 h-4 object-contain" />
				<span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
					Desarrollo y diseño por <span className="font-semibold text-gray-600 dark:text-gray-400">colidevs.</span>
				</span>
			</a>
			<p className="text-center text-[10px] text-gray-300 dark:text-gray-700 mt-1">
				© {year} Colidevs. Todos los derechos reservados.
			</p>
		</footer>
	);
}
