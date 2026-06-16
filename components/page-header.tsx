"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	color?: string;
	showBack?: boolean;
}

export function PageHeader({
	title,
	subtitle,
	color = "bg-violet-700",
	showBack = true,
}: PageHeaderProps) {
	const router = useRouter();

	return (
		<div className={cn("text-white px-4 pt-12 pb-6", color)}>
			<div className="flex items-center justify-between mb-4">
				{showBack ? (
					<button
						onClick={() => router.back()}
						className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
						aria-label="Volver"
					>
						<ChevronLeft className="w-5 h-5" />
					</button>
				) : (
					<div className="w-9" />
				)}
				<ThemeToggle />
			</div>
			<h1 className="text-xl font-bold">{title}</h1>
			{subtitle && <p className="text-sm mt-1 opacity-75">{subtitle}</p>}
		</div>
	);
}
