"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, MapPin, Phone, Map, Shield, ChevronRight, Clock, Loader2 } from "lucide-react";
import { BottomNav, SideNav } from "@/components/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColiFooter } from "@/components/coli-footer";
import type { Incident, Stats } from "@/lib/types";

const actions = [
	{
		href: "/denunciar",
		icon: AlertTriangle,
		label: "Denunciar acoso",
		description: "Reportá un incidente ahora",
		card: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
		text: "text-rose-800 dark:text-rose-300",
		icon_wrap: "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400",
	},
	{
		href: "/punto-seguro",
		icon: MapPin,
		label: "Punto seguro",
		description: "Comercios adheridos cerca",
		card: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
		text: "text-emerald-800 dark:text-emerald-300",
		icon_wrap: "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400",
	},
	{
		href: "/asistencia",
		icon: Phone,
		label: "Contactar asistencia",
		description: "Ayuda psicológica y legal",
		card: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
		text: "text-blue-800 dark:text-blue-300",
		icon_wrap: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
	},
	{
		href: "/mapa",
		icon: Map,
		label: "Ver mapa",
		description: "Zonas de riesgo en CABA",
		card: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800",
		text: "text-violet-800 dark:text-violet-300",
		icon_wrap: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400",
	},
] as const;

const INCIDENT_LABELS: Record<string, string> = {
	verbal: "Acoso verbal",
	seguimiento: "Seguimiento",
	exhibicionismo: "Exhibicionismo",
	contacto: "Contacto físico",
	fotografia: "Fotografía sin consentimiento",
	intimidacion: "Intimidación",
	otro: "Otro",
};

const DOT_COLOR: Record<string, string> = {
	verbal: "bg-orange-500",
	seguimiento: "bg-rose-500",
	exhibicionismo: "bg-red-500",
	contacto: "bg-rose-600",
	fotografia: "bg-orange-400",
	intimidacion: "bg-red-600",
	otro: "bg-gray-400",
};

function relativeTime(isoDate: string): string {
	const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
	if (diff < 3600) return `Hace ${Math.round(diff / 60)} min`;
	if (diff < 86400) return `Hace ${Math.round(diff / 3600)} h`;
	return `Hace ${Math.round(diff / 86400)} días`;
}

const DEFAULT_STATS: Stats = { incidents_today: 0, risk_zones: 0, safe_places: 0 };

export default function HomePage() {
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			fetch("/api/incidents?limit=5").then((r) => r.json()),
			fetch("/api/stats").then((r) => r.json()),
		])
			.then(([inc, st]) => {
				setIncidents(Array.isArray(inc) ? inc : []);
				setStats(st ?? DEFAULT_STATS);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
			<SideNav />

			<main className="flex-1 min-w-0">
				<div className="max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl">
					{/* Header */}
					<div className="bg-violet-700 dark:bg-violet-950 text-white px-6 pt-14 pb-10">
						<div className="flex items-center justify-between mb-5">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
									<Shield className="w-5 h-5" />
								</div>
								<span className="text-lg font-bold tracking-tight">AlertaBA</span>
							</div>
							<ThemeToggle />
						</div>
						<h1 className="text-2xl font-bold leading-snug">¿Necesitás ayuda?</h1>
						<p className="text-violet-200 text-sm mt-1">
							No estás sola. Reportá, encontrá ayuda y accedé a asistencia.
						</p>
					</div>

					{/* Action cards */}
					<div className="px-4 -mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
						{actions.map(({ href, icon: Icon, label, description, card, text, icon_wrap }) => (
							<Link
								key={href}
								href={href}
								className={`flex flex-col gap-3 p-4 rounded-2xl border-2 ${card} ${text} transition-transform active:scale-[0.97] select-none`}
							>
								<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${icon_wrap}`}>
									<Icon className="w-5 h-5" />
								</div>
								<div>
									<div className="font-semibold text-sm leading-tight">{label}</div>
									<div className="text-xs opacity-60 mt-0.5">{description}</div>
								</div>
							</Link>
						))}
					</div>

					{/* Emergency strip */}
					<div className="mx-4 mt-4 bg-rose-600 dark:bg-rose-900 rounded-2xl p-4 flex items-center justify-between">
						<div>
							<div className="text-white font-bold text-sm">Situación de peligro</div>
							<div className="text-rose-200 text-xs mt-0.5">Llamá al número de emergencias</div>
						</div>
						<a
							href="tel:911"
							className="bg-white text-rose-600 font-bold text-xl px-5 py-2 rounded-xl active:scale-95 transition-transform"
						>
							911
						</a>
					</div>

					{/* Stats */}
					<div className="px-4 mt-4 grid grid-cols-3 gap-2">
						{[
							{ label: "Reportes hoy", value: stats.incidents_today.toString() },
							{ label: "Zonas de riesgo", value: stats.risk_zones.toString() },
							{ label: "Puntos seguros", value: stats.safe_places.toString() },
						].map(({ label, value }) => (
							<div
								key={label}
								className="bg-white dark:bg-gray-900 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-800"
							>
								{loading ? (
									<Loader2 className="w-5 h-5 text-violet-400 animate-spin mx-auto" />
								) : (
									<div className="text-xl font-bold text-violet-700 dark:text-violet-400">{value}</div>
								)}
								<div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{label}</div>
							</div>
						))}
					</div>

					{/* Recent incidents */}
					<div className="px-4 mt-5 mb-28 md:mb-8">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
								Reportes recientes
							</h2>
							<Link href="/mapa" className="text-xs text-violet-600 dark:text-violet-400 font-medium">
								Ver en mapa
							</Link>
						</div>

						<div className="space-y-2">
							{loading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
								</div>
							) : incidents.length === 0 ? (
								<div className="text-center py-8 text-sm text-gray-400 dark:text-gray-600">
									Sin reportes recientes
								</div>
							) : (
								incidents.map((incident) => (
									<div
										key={incident.id}
										className="bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-gray-800"
									>
										<div className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLOR[incident.type] ?? "bg-gray-400"}`} />
										<div className="flex-1 min-w-0">
											<div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
												{INCIDENT_LABELS[incident.type] ?? incident.type}
											</div>
											<div className="flex items-center gap-1 mt-0.5">
												<MapPin className="w-3 h-3 text-gray-300 dark:text-gray-600 flex-shrink-0" />
												<span className="text-xs text-gray-400 dark:text-gray-500 truncate">
													{incident.address ?? incident.neighborhood ?? "CABA"}
												</span>
											</div>
										</div>
										<div className="flex items-center gap-1 flex-shrink-0">
											<Clock className="w-3 h-3 text-gray-300 dark:text-gray-600" />
											<span className="text-xs text-gray-400 dark:text-gray-500">
												{relativeTime(incident.created_at)}
											</span>
										</div>
										<ChevronRight className="w-4 h-4 text-gray-200 dark:text-gray-700 flex-shrink-0" />
									</div>
								))
							)}
						</div>
					</div>
				</div>
				<ColiFooter />
			</main>

			<BottomNav />
		</div>
	);
}
