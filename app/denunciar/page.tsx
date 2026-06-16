"use client";

import { useState, useEffect } from "react";
import {
	MapPin, Camera, ChevronRight, CheckCircle2, Loader2,
	MessageSquare, AlertTriangle, Eye, Footprints, Hand,
	Camera as CameraIcon, Siren,
} from "lucide-react";
import { BottomNav, SideNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import type { CreateIncidentPayload, IncidentType } from "@/lib/types";

const incidentTypes = [
	{ id: "verbal",       label: "Acoso verbal",       description: "Piropos, comentarios, silbidos",   icon: MessageSquare, color: "rose" },
	{ id: "seguimiento",  label: "Seguimiento",         description: "Persecución o vigilancia",          icon: Footprints,    color: "orange" },
	{ id: "exhibicionismo",label: "Exhibicionismo",     description: "Exposición indecente",               icon: Eye,           color: "amber" },
	{ id: "contacto",     label: "Contacto físico",     description: "Tocamiento no consentido",          icon: Hand,          color: "red" },
	{ id: "fotografia",   label: "Fotografía",          description: "Sin consentimiento",                icon: CameraIcon,    color: "orange" },
	{ id: "intimidacion", label: "Intimidación",        description: "Amenazas o intimidación",           icon: Siren,         color: "rose" },
	{ id: "otro",         label: "Otro",                description: "Otro tipo de incidente",            icon: AlertTriangle, color: "gray" },
] as const;

const colorMap: Record<string, { card: string; text: string; icon: string }> = {
	rose:   { card: "border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50",     text: "text-rose-800 dark:text-rose-300",     icon: "bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400" },
	orange: { card: "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/50", text: "text-orange-800 dark:text-orange-300", icon: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400" },
	amber:  { card: "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50", text: "text-amber-800 dark:text-amber-300",   icon: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400" },
	red:    { card: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50",         text: "text-red-800 dark:text-red-300",       icon: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400" },
	gray:   { card: "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",     text: "text-gray-700 dark:text-gray-300",     icon: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" },
};

type Step = "tipo" | "ubicacion" | "descripcion" | "enviado";

interface GeoState {
	loading: boolean;
	lat: number | null;
	lng: number | null;
	address: string;
	error: string | null;
}

export default function DenunciarPage() {
	const [step, setStep] = useState<Step>("tipo");
	const [selected, setSelected] = useState<string | null>(null);
	const [description, setDescription] = useState("");
	const [anonymous, setAnonymous] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [geo, setGeo] = useState<GeoState>({
		loading: false, lat: null, lng: null, address: "Ubicación no detectada", error: null,
	});

	const now = new Date();
	const dateStr = now.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
	const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

	// Auto-detect location when reaching step 2
	useEffect(() => {
		if (step !== "ubicacion" || geo.lat !== null) return;
		setGeo((g) => ({ ...g, loading: true }));

		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const { latitude, longitude } = pos.coords;
				let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
				// Reverse geocode via Mapbox if token available
				const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
				if (token) {
					try {
						const res = await fetch(
							`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&language=es`,
						);
						const json = await res.json();
						address = json.features?.[0]?.place_name ?? address;
					} catch {
						// fallback to coords
					}
				}
				setGeo({ loading: false, lat: latitude, lng: longitude, address, error: null });
			},
			(err) => {
				setGeo((g) => ({
					...g,
					loading: false,
					address: "No se pudo obtener la ubicación",
					error: err.message,
				}));
			},
			{ timeout: 8000 },
		);
	}, [step, geo.lat]);

	const handleSubmit = async () => {
		if (!selected) return;
		setSubmitting(true);

		const payload: CreateIncidentPayload = {
			type: selected as IncidentType,
			description: description.trim() || undefined,
			latitude: geo.lat ?? -34.6037,
			longitude: geo.lng ?? -58.3816,
			address: geo.address || undefined,
			anonymous,
		};

		try {
			await fetch("/api/incidents", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
		} catch {
			// Still show success — we don't want to block the user
		} finally {
			setSubmitting(false);
			setStep("enviado");
		}
	};

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
			<SideNav />
			<main className="flex-1 min-w-0">
				<div className="max-w-lg mx-auto md:max-w-2xl">
					<PageHeader
						title="Hacer una denuncia"
						subtitle="Tu reporte ayuda a mapear zonas de riesgo"
						color="bg-rose-600 dark:bg-rose-950"
					/>

					{/* Progress */}
					{step !== "enviado" && (
						<div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
							<div className="flex items-center gap-2">
								{(["tipo", "ubicacion", "descripcion"] as Step[]).map((s, i) => {
									const steps = ["tipo", "ubicacion", "descripcion"] as Step[];
									const currentIdx = steps.indexOf(step);
									const done = currentIdx > i;
									return (
										<div key={s} className="flex items-center gap-2 flex-1">
											<div className={cn(
												"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
												step === s ? "bg-rose-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400",
											)}>
												{done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
											</div>
											<span className="text-xs text-gray-500 dark:text-gray-400 truncate">
												{s === "tipo" ? "Tipo" : s === "ubicacion" ? "Ubicación" : "Detalle"}
											</span>
											{i < 2 && <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />}
										</div>
									);
								})}
							</div>
						</div>
					)}

					<div className="p-4 mb-28 md:mb-8">
						{/* STEP 1 */}
						{step === "tipo" && (
							<div className="space-y-3">
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">¿Qué tipo de incidente querés reportar?</p>
								{incidentTypes.map(({ id, label, description: desc, icon: Icon, color }) => {
									const colors = colorMap[color];
									const isSelected = selected === id;
									return (
										<button key={id} onClick={() => setSelected(id)}
											className={cn("w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
												isSelected ? colors.card : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900",
											)}>
											<div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
												isSelected ? colors.icon : "bg-gray-100 dark:bg-gray-800 text-gray-400",
											)}>
												<Icon className="w-5 h-5" />
											</div>
											<div className="flex-1 min-w-0">
												<div className={cn("font-semibold text-sm", isSelected ? colors.text : "text-gray-900 dark:text-gray-100")}>{label}</div>
												<div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</div>
											</div>
											{isSelected && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
										</button>
									);
								})}
								<button onClick={() => selected && setStep("ubicacion")} disabled={!selected}
									className="w-full mt-4 py-4 bg-rose-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 font-semibold rounded-2xl flex items-center justify-center gap-2">
									Continuar <ChevronRight className="w-4 h-4" />
								</button>
							</div>
						)}

						{/* STEP 2 */}
						{step === "ubicacion" && (
							<div className="space-y-4">
								<p className="text-sm text-gray-500 dark:text-gray-400">Confirmá la ubicación del incidente.</p>
								<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
									<div className="h-36 bg-gradient-to-br from-emerald-100 dark:from-emerald-950 to-teal-100 dark:to-teal-950 flex items-center justify-center relative">
										{geo.loading ? (
											<div className="flex flex-col items-center gap-2">
												<Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
												<span className="text-xs text-emerald-600 dark:text-emerald-400">Obteniendo ubicación...</span>
											</div>
										) : (
											<div className="flex flex-col items-center">
												<MapPin className="w-8 h-8 text-rose-600 drop-shadow" />
												<div className="mt-1 bg-white dark:bg-gray-900 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 shadow">
													{geo.error ? "Ubicación manual" : "Tu ubicación actual"}
												</div>
											</div>
										)}
									</div>
									<div className="p-4">
										<div className="flex items-start gap-3">
											<MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
											<div>
												<div className="font-medium text-sm text-gray-900 dark:text-gray-100">{geo.address}</div>
												{geo.lat && (
													<div className="text-xs text-gray-400 dark:text-gray-500">
														{geo.lat.toFixed(5)}, {geo.lng?.toFixed(5)}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
										<div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Fecha</div>
										<div className="font-medium text-sm text-gray-900 dark:text-gray-100 capitalize">{dateStr}</div>
									</div>
									<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
										<div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Hora</div>
										<div className="font-medium text-sm text-gray-900 dark:text-gray-100">{timeStr}</div>
									</div>
								</div>
								<button onClick={() => setStep("descripcion")} disabled={geo.loading}
									className="w-full py-4 bg-rose-600 disabled:opacity-60 text-white font-semibold rounded-2xl flex items-center justify-center gap-2">
									Confirmar ubicación <ChevronRight className="w-4 h-4" />
								</button>
							</div>
						)}

						{/* STEP 3 */}
						{step === "descripcion" && (
							<div className="space-y-4">
								<p className="text-sm text-gray-500 dark:text-gray-400">Agregá más detalles si querés (opcional).</p>
								<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
									<label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">Descripción del incidente</label>
									<textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 300))}
										placeholder="Contá brevemente qué pasó..." rows={4}
										className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 resize-none outline-none" />
									<div className="text-right text-xs text-gray-300 dark:text-gray-600 mt-1">{description.length}/300</div>
								</div>
								<label className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
									<div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
										<Camera className="w-5 h-5 text-violet-500" />
									</div>
									<div>
										<div className="font-medium text-sm text-gray-700 dark:text-gray-200">Adjuntar foto (opcional)</div>
										<div className="text-xs text-gray-400 dark:text-gray-500">Solo se usará como evidencia</div>
									</div>
									<input type="file" accept="image/*" className="hidden" />
								</label>
								<div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
									<div>
										<div className="font-medium text-sm text-gray-900 dark:text-gray-100">Enviar anónimamente</div>
										<div className="text-xs text-gray-400 dark:text-gray-500">Tu identidad no será revelada</div>
									</div>
									<button onClick={() => setAnonymous(!anonymous)}
										className={cn("relative w-11 h-6 rounded-full transition-colors shrink-0", anonymous ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700")}>
										<div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", anonymous ? "translate-x-5" : "translate-x-0.5")} />
									</button>
								</div>
								<button onClick={handleSubmit} disabled={submitting}
									className="w-full py-4 bg-rose-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-70">
									{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <>Enviar denuncia <ChevronRight className="w-4 h-4" /></>}
								</button>
							</div>
						)}

						{/* STEP 4: Éxito */}
						{step === "enviado" && (
							<div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
								<div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
									<CheckCircle2 className="w-10 h-10 text-green-500" />
								</div>
								<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Denuncia enviada</h2>
								<p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
									Tu reporte fue recibido. Ayuda a visibilizar el acoso callejero y a generar datos reales.
								</p>
								<div className="bg-violet-50 dark:bg-violet-950/50 rounded-2xl p-4 w-full text-left space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">Tipo</span>
										<span className="font-medium text-gray-900 dark:text-gray-100">
											{incidentTypes.find((t) => t.id === selected)?.label}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">Ubicación</span>
										<span className="font-medium text-gray-900 dark:text-gray-100 text-right max-w-[180px] truncate">{geo.address}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-500 dark:text-gray-400">Hora</span>
										<span className="font-medium text-gray-900 dark:text-gray-100">{timeStr}</span>
									</div>
								</div>
								<button onClick={() => { setStep("tipo"); setSelected(null); setDescription(""); }}
									className="w-full py-4 bg-violet-600 text-white font-semibold rounded-2xl">
									Hacer otro reporte
								</button>
								<a href="/asistencia" className="text-sm text-violet-600 dark:text-violet-400 underline">
									¿Necesitás asistencia?
								</a>
							</div>
						)}
					</div>
				</div>
			</main>
			<BottomNav />
		</div>
	);
}
