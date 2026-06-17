"use client";

import { Home, Map, AlertCircle, LifeBuoy, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/", icon: Home, label: "Inicio" },
	{ href: "/mapa", icon: Map, label: "Mapa" },
	{ href: "/denunciar", icon: AlertCircle, label: "Denunciar" },
	{ href: "/asistencia", icon: LifeBuoy, label: "Ayuda" },
	{ href: "/informacion", icon: Info, label: "Info" },
];

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
			<div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
				{navItems.map(({ href, icon: Icon, label }) => {
					const isActive = pathname === href;
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors",
								isActive
									? "text-violet-600 dark:text-violet-400"
									: "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
							)}
						>
							<Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
							<span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
								{label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}


/* Sidebar nav for desktop (md+) */
export function SideNav() {
	const pathname = usePathname();

	return (
		<aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
			<div className="px-5 py-6">
				<div className="flex items-center gap-2 mb-8">
					<div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center">
						<span className="text-white text-xs font-bold">A</span>
					</div>
					<span className="font-bold text-gray-900 dark:text-white">AlertaBA</span>
				</div>
				<nav className="space-y-1">
					{navItems.map(({ href, icon: Icon, label }) => {
						const isActive = pathname === href;
						return (
							<Link
								key={href}
								href={href}
								className={cn(
									"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
									isActive
										? "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
										: "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
								)}
							>
								<Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
								{label}
							</Link>
						);
					})}
				</nav>
			</div>
			<div className="mt-auto px-5 py-4 border-t border-gray-200 dark:border-gray-800">
				<a
					href="tel:911"
					className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-colors"
				>
					Emergencia 911
				</a>
				<a
					href="https://www.coli.com.ar/"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center gap-1.5 mt-3"
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="https://www.coli.com.ar/colibri-web.png" alt="Colidevs" className="w-3.5 h-3.5 object-contain opacity-60" />
					<span className="text-[10px] text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">by colidevs.</span>
				</a>
			</div>
		</aside>
	);
}
