"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Filter, Plus, Loader2 } from "lucide-react";
import { BottomNav, SideNav } from "@/components/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Incident, SafePlace } from "@/lib/types";

// ssr: false — mapbox-gl accesses `window` at import time
const MapboxMap = dynamic(
	() => import("@/components/mapbox-map").then((m) => m.MapboxMap),
	{
		ssr: false,
		loading: () => (
			<div className="absolute inset-0 bg-slate-700 dark:bg-gray-900 flex items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-white/70">
					<Loader2 className="w-7 h-7 animate-spin" />
					<span className="text-sm">Cargando mapa...</span>
				</div>
			</div>
		),
	},
);

// ─── Filter config ────────────────────────────────────────────────────────────

const FILTERS = [
	{ id: "riesgo",    label: "Zonas de riesgo", dot: "bg-rose-500" },
	{ id: "seguros",   label: "Puntos seguros",  dot: "bg-emerald-500" },
] as const;

const LEGEND = [
	{ dot: "bg-rose-500",    label: "Zona de alta incidencia" },
	{ dot: "bg-emerald-500", label: "Comercio seguro" },
	{ dot: "bg-blue-500",    label: "Comisaría" },
	{ dot: "bg-amber-500",   label: "Centro de asistencia" },
];

const TYPE_LABEL: Record<string, string> = {
	verbal: "Acoso verbal",
	seguimiento: "Seguimiento",
	exhibicionismo: "Exhibicionismo",
	contacto: "Contacto físico",
	fotografia: "Fotografía",
	intimidacion: "Intimidación",
	otro: "Otro",
};

function relTime(iso: string) {
	const s = (Date.now() - new Date(iso).getTime()) / 1000;
	if (s < 3600) return `${Math.round(s / 60)} min`;
	if (s < 86400) return `${Math.round(s / 3600)} h`;
	return `${Math.round(s / 86400)} d`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MapaPage() {
	const [activeFilters, setActiveFilters] = useState<string[]>(["riesgo", "seguros"]);
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
	const [loadingData, setLoadingData] = useState(true);

	// Fetch map data
	useEffect(() => {
		Promise.all([
			fetch("/api/incidents?limit=100").then((r) => r.json()),
			fetch("/api/safe-places").then((r) => r.json()),
		])
			.then(([inc, sp]) => {
				setIncidents(Array.isArray(inc) ? inc : []);
				setSafePlaces(Array.isArray(sp) ? sp : []);
			})
			.catch(console.error)
			.finally(() => setLoadingData(false));
	}, []);

	const toggleFilter = (id: string) =>
		setActiveFilters((prev) =>
			prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
		);

	// Last 3 incidents for activity panel
	const recent = incidents.slice(0, 3);

	return (
		<div className="flex h-screen bg-gray-950 overflow-hidden">
			<SideNav />

			<div className="flex-1 flex flex-col min-w-0 relative">
				{/* ── Top bar ───────────────────────────────────────────────── */}
				<div className="absolute top-0 left-0 right-0 z-20 p-4 pointer-events-none">
					<div className="flex items-start justify-between">
						{/* Live badge */}
						<div className="pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2">
							<div className={cn("w-2 h-2 rounded-full", loadingData ? "bg-amber-400 animate-pulse" : "bg-green-500 animate-pulse")} />
							<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
								{loadingData ? "Cargando..." : `En vivo — ${incidents.length} reportes`}
							</span>
						</div>

						{/* Actions */}
						<div className="pointer-events-auto flex gap-2">
							<ThemeToggle className="bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900" />
							<Link
								href="/"
								className="bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg text-gray-700 dark:text-gray-300 w-9 h-9 flex items-center justify-center rounded-xl text-sm"
							>
								✕
							</Link>
						</div>
					</div>

					{/* Filter pills */}
					<div className="pointer-events-auto flex gap-2 mt-3 overflow-x-auto pb-1">
						{FILTERS.map(({ id, label, dot }) => (
							<button
								key={id}
								onClick={() => toggleFilter(id)}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow border-2 transition-all",
									activeFilters.includes(id)
										? "bg-white dark:bg-gray-900 border-transparent text-gray-900 dark:text-gray-100"
										: "bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-700 text-gray-400 dark:text-gray-500",
								)}
							>
								<div className={cn("w-2 h-2 rounded-full", dot, !activeFilters.includes(id) && "opacity-30")} />
								{label}
							</button>
						))}
					</div>
				</div>

				{/* ── Mapbox ────────────────────────────────────────────────── */}
				<MapboxMap
					incidents={incidents}
					safePlaces={safePlaces}
					showIncidents={activeFilters.includes("riesgo")}
					showSafePlaces={activeFilters.includes("seguros")}
				/>

				{/* ── Bottom panel ──────────────────────────────────────────── */}
				<div className="absolute bottom-16 left-0 right-0 z-20 px-4 md:bottom-4 space-y-2">
					{/* Legend */}
					<div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-2xl p-3 shadow-xl">
						<div className="flex items-center gap-4 flex-wrap">
							{LEGEND.map(({ dot, label }) => (
								<div key={label} className="flex items-center gap-1.5">
									<div className={cn("w-2.5 h-2.5 rounded-full", dot)} />
									<span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
								</div>
							))}
						</div>
					</div>

					{/* Recent activity */}
					<div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-2xl p-3 shadow-xl">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
								Actividad reciente
							</span>
							<Filter className="w-3.5 h-3.5 text-gray-400" />
						</div>
						{loadingData ? (
							<div className="flex items-center gap-2 text-xs text-gray-400">
								<Loader2 className="w-3 h-3 animate-spin" /> Cargando...
							</div>
						) : recent.length === 0 ? (
							<div className="text-xs text-gray-400">Sin reportes recientes</div>
						) : (
							<div className="space-y-2">
								{recent.map((inc) => (
									<div key={inc.id} className="flex items-center gap-2">
										<div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
										<span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
											{TYPE_LABEL[inc.type] ?? inc.type}
										</span>
										<span className="text-xs text-gray-400 shrink-0">·</span>
										<span className="text-xs text-gray-400 truncate">{inc.neighborhood ?? "CABA"}</span>
										<span className="ml-auto text-xs text-gray-300 dark:text-gray-600 shrink-0">
											{relTime(inc.created_at)}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* ── FAB ───────────────────────────────────────────────────── */}
				<Link
					href="/denunciar"
					className="absolute bottom-36 right-4 z-30 w-14 h-14 bg-rose-600 hover:bg-rose-700 rounded-full shadow-xl flex items-center justify-center text-white transition-colors md:bottom-24"
					title="Hacer una denuncia"
				>
					<Plus className="w-6 h-6" />
				</Link>
			</div>

			<BottomNav />
		</div>
	);
}
