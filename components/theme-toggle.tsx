"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return <div className="w-9 h-9" />;

	return (
		<button
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className={cn(
				"w-9 h-9 flex items-center justify-center rounded-xl",
				"bg-white/20 hover:bg-white/30 text-white transition-colors",
				className,
			)}
			aria-label="Cambiar tema"
		>
			{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
		</button>
	);
}
