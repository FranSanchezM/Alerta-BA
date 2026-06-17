"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Clock, ShoppingBag, Pill, Coffee, BookOpen, Building, Search, Star, Loader2 } from "lucide-react";
import { BottomNav, SideNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { ColiFooter } from "@/components/coli-footer";
import { cn } from "@/lib/utils";
import type { SafePlace, SafePlaceCategory } from "@/lib/types";

const categories = [
	{ id: "todos",    label: "Todos" },
	{ id: "farmacia", label: "Farmacias" },
	{ id: "kiosco",   label: "Kioscos" },
	{ id: "cafe",     label: "Cafés" },
	{ id: "libreria", label: "Librerías" },
	{ id: "banco",    label: "Bancos" },
];

const CATEGORY_ICON: Record<SafePlaceCategory | "otro", typeof Pill> = {
	farmacia: Pill,
	kiosco:   ShoppingBag,
	cafe:     Coffee,
	libreria: BookOpen,
	banco:    Building,
	otro:     MapPin,
};

function formatDistance(m?: number): string {
	if (m == null) return "";
	if (m < 1000) return `${Math.round(m)} m`;
	return `${(m / 1000).toFixed(1)} km`;
}

export default function PuntoSeguroPage() {
	const [activeCategory, setActiveCategory] = useState("todos");
	const [search, setSearch] = useState("");
	const [places, setPlaces] = useState<SafePlace[]>([]);
	const [loading, setLoading] = useState(true);
	const [userLat, setUserLat] = useState<number | null>(null);
	const [userLng, setUserLng] = useState<number | null>(null);

	// Get user location then fetch places
	useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setUserLat(pos.coords.latitude);
				setUserLng(pos.coords.longitude);
			},
			() => {
				// Buenos Aires center as fallback
				setUserLat(-34.6037);
				setUserLng(-58.3816);
			},
			{ timeout: 5000 },
		);
	}, []);

	useEffect(() => {
		const fetchPlaces = async () => {
			setLoading(true);
			const params = new URLSearchParams({ category: activeCategory });
			if (userLat && userLng) {
				params.set("lat", userLat.toString());
				params.set("lng", userLng.toString());
				params.set("radius", "2000");
			}
			const res = await fetch(`/api/safe-places?${params}`);
			if (res.ok) setPlaces(await res.json());
			setLoading(false);
		};
		fetchPlaces();
	}, [activeCategory, userLat, userLng]);

	const filtered = places.filter(
		(p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
			<SideNav />
			<main className="flex-1 min-w-0">
				<div className="max-w-lg mx-auto md:max-w-2xl">
					<PageHeader title="Puntos seguros" subtitle="Comercios adheridos cerca de vos" color="bg-emerald-600 dark:bg-emerald-950" />

					{/* Mini map */}
					<div className="mx-4 mt-4 h-32 rounded-2xl overflow-hidden relative bg-gradient-to-br from-emerald-100 dark:from-emerald-950 to-teal-100 dark:to-teal-950">
						<svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 128">
							{[50, 100, 150, 200, 250, 300, 350].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="128" stroke="#000" strokeWidth="0.5" />)}
							{[32, 64, 96].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#000" strokeWidth="0.5" />)}
						</svg>
						<div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
							<div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
							<div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-50" />
						</div>
						{[{ x: "38%", y: "38%" }, { x: "62%", y: "44%" }, { x: "45%", y: "68%" }, { x: "70%", y: "30%" }, { x: "28%", y: "60%" }].map((pos, i) => (
							<div key={i} className="absolute w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow" style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }} />
						))}
						<div className="absolute bottom-2 right-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
							{places.length} puntos cerca
						</div>
					</div>

					{/* Search */}
					<div className="px-4 mt-3">
						<div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
							<Search className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
							<input value={search} onChange={(e) => setSearch(e.target.value)} type="text"
								placeholder="Buscar por nombre o dirección..."
								className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 outline-none" />
						</div>
					</div>

					{/* Categories */}
					<div className="px-4 mt-3 flex gap-2 overflow-x-auto pb-1">
						{categories.map(({ id, label }) => (
							<button key={id} onClick={() => setActiveCategory(id)}
								className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
									activeCategory === id ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
								)}>
								{label}
							</button>
						))}
					</div>

					{/* List */}
					<div className="px-4 mt-3 mb-28 md:mb-8 space-y-3">
						{loading ? (
							<div className="flex items-center justify-center py-10">
								<Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
							</div>
						) : filtered.length === 0 ? (
							<div className="text-center py-10 text-gray-400 dark:text-gray-600 text-sm">No hay resultados</div>
						) : (
							filtered.map((place) => {
								const Icon = CATEGORY_ICON[place.category] ?? MapPin;
								return (
									<div key={place.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
										<div className="flex items-start gap-3">
											<div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
												<Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2">
													<div>
														<div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{place.name}</div>
														<div className="flex items-center gap-1 mt-0.5">
															<MapPin className="w-3 h-3 text-gray-300 dark:text-gray-600" />
															<span className="text-xs text-gray-400 dark:text-gray-500">{place.address}</span>
														</div>
													</div>
													<div className="shrink-0 flex flex-col items-end gap-1">
														{place.distance_m != null && (
															<span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">{formatDistance(place.distance_m)}</span>
														)}
														<div className="flex items-center gap-0.5">
															<Star className="w-3 h-3 text-amber-400 fill-amber-400" />
															<span className="text-xs text-gray-500 dark:text-gray-400">Adherido</span>
														</div>
													</div>
												</div>
												{place.hours && (
													<div className="flex items-center gap-1 mt-2">
														<Clock className="w-3 h-3 text-emerald-500" />
														<span className="text-xs text-gray-400 dark:text-gray-500">{place.hours}</span>
													</div>
												)}
											</div>
										</div>
										<div className="mt-3 flex gap-2">
											<a
												href={`https://maps.google.com/?q=${place.latitude},${place.longitude}`}
												target="_blank"
												rel="noopener noreferrer"
												className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-900"
											>
												<Navigation className="w-3.5 h-3.5" /> Cómo llegar
											</a>
											{place.phone && (
												<a
													href={`tel:${place.phone}`}
													className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl border border-gray-100 dark:border-gray-700"
												>
													Llamar
												</a>
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
				<ColiFooter />
			</main>
			<BottomNav />
		</div>
	);
}
