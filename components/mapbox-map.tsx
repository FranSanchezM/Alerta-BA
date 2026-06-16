"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { Incident, SafePlace } from "@/lib/types";
import maplibregl from "maplibre-gl";
// CSS importado en globals.css para evitar problemas con dynamic import

// ─── Estilos CARTO — sin API key, 100% gratis ────────────────────────────────
const LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DARK_STYLE  = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const CABA_CENTER: [number, number] = [-58.3816, -34.6037];

// ─── Colores por tipo ─────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
	verbal:         "#f97316",
	seguimiento:    "#f43f5e",
	exhibicionismo: "#ef4444",
	contacto:       "#dc2626",
	fotografia:     "#fb923c",
	intimidacion:   "#e11d48",
	otro:           "#6b7280",
};

const TYPE_LABEL: Record<string, string> = {
	verbal:         "Acoso verbal",
	seguimiento:    "Seguimiento",
	exhibicionismo: "Exhibicionismo",
	contacto:       "Contacto físico",
	fotografia:     "Fotografía s/consentimiento",
	intimidacion:   "Intimidación",
	otro:           "Otro",
};

// ─── GeoJSON helpers ──────────────────────────────────────────────────────────
function toIncidentsGeoJSON(incidents: Incident[]): GeoJSON.FeatureCollection {
	return {
		type: "FeatureCollection",
		features: incidents.map((inc) => ({
			type: "Feature",
			geometry: { type: "Point", coordinates: [inc.longitude, inc.latitude] },
			properties: {
				id:           inc.id,
				label:        TYPE_LABEL[inc.type] ?? inc.type,
				color:        TYPE_COLOR[inc.type] ?? "#6b7280",
				description:  inc.description ?? "",
				address:      inc.address ?? "",
				neighborhood: inc.neighborhood ?? "",
				created_at:   inc.created_at,
			},
		})),
	};
}

function toSafePlacesGeoJSON(places: SafePlace[]): GeoJSON.FeatureCollection {
	return {
		type: "FeatureCollection",
		features: places.map((p) => ({
			type: "Feature",
			geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
			properties: {
				name:    p.name,
				address: p.address,
				phone:   p.phone ?? "",
				hours:   p.hours ?? "",
			},
		})),
	};
}

function relTime(iso: string) {
	const s = (Date.now() - new Date(iso).getTime()) / 1000;
	if (s < 3600)  return `Hace ${Math.round(s / 60)} min`;
	if (s < 86400) return `Hace ${Math.round(s / 3600)} h`;
	return `Hace ${Math.round(s / 86400)} días`;
}

// ─── Popups ───────────────────────────────────────────────────────────────────
function incidentHTML(p: Record<string, string>) {
	return `<div style="font-family:system-ui,sans-serif;min-width:180px;">
		<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
			<div style="width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0;"></div>
			<b style="font-size:13px;">${p.label}</b>
		</div>
		${p.address      ? `<div style="font-size:11px;color:#666;margin-bottom:2px;">📍 ${p.address}</div>` : ""}
		${p.neighborhood ? `<div style="font-size:11px;color:#888;">${p.neighborhood}</div>` : ""}
		<div style="font-size:11px;color:#aaa;margin-top:4px;">${relTime(p.created_at)}</div>
		${p.description  ? `<div style="font-size:12px;color:#555;margin-top:6px;padding-top:6px;border-top:1px solid #eee;font-style:italic;">"${p.description}"</div>` : ""}
	</div>`;
}

function safeHTML(p: Record<string, string>) {
	return `<div style="font-family:system-ui,sans-serif;min-width:180px;">
		<div style="font-size:10px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">✓ Punto seguro</div>
		<b style="font-size:13px;">${p.name}</b>
		<div style="font-size:11px;color:#666;margin-top:2px;">📍 ${p.address}</div>
		${p.hours ? `<div style="font-size:11px;color:#888;margin-top:2px;">🕐 ${p.hours}</div>` : ""}
		${p.phone ? `<div style="margin-top:6px;"><a href="tel:${p.phone}" style="font-size:12px;color:#2563eb;font-weight:600;">📞 ${p.phone}</a></div>` : ""}
	</div>`;
}

// ─── Fuentes y capas ──────────────────────────────────────────────────────────
function addSources(map: maplibregl.Map) {
	map.addSource("incidents", {
		type: "geojson",
		data: { type: "FeatureCollection", features: [] },
		cluster: true,
		clusterMaxZoom: 14,
		clusterRadius: 50,
	});

	map.addSource("safe-places", {
		type: "geojson",
		data: { type: "FeatureCollection", features: [] },
	});
}

function addLayers(map: maplibregl.Map) {
	// Cluster halo
	map.addLayer({ id: "cluster-halo", type: "circle", source: "incidents",
		filter: ["has", "point_count"],
		paint: { "circle-color": "#e11d48", "circle-radius": ["step", ["get", "point_count"], 26, 5, 33, 15, 42], "circle-opacity": 0.18 },
	});
	// Cluster fill
	map.addLayer({ id: "clusters", type: "circle", source: "incidents",
		filter: ["has", "point_count"],
		paint: { "circle-color": "#e11d48", "circle-radius": ["step", ["get", "point_count"], 18, 5, 24, 15, 32], "circle-opacity": 0.9, "circle-stroke-width": 3, "circle-stroke-color": "#fff" },
	});
	// Cluster count
	map.addLayer({ id: "cluster-count", type: "symbol", source: "incidents",
		filter: ["has", "point_count"],
		layout: { "text-field": "{point_count_abbreviated}", "text-size": 12 },
		paint: { "text-color": "#fff" },
	});
	// Individual incidents
	map.addLayer({ id: "incident-points", type: "circle", source: "incidents",
		filter: ["!", ["has", "point_count"]],
		paint: {
			"circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 7, 15, 11],
			"circle-color": ["get", "color"],
			"circle-stroke-width": 2.5,
			"circle-stroke-color": "#fff",
			"circle-opacity": 0.92,
		},
	});
	// Safe places
	map.addLayer({ id: "safe-points", type: "circle", source: "safe-places",
		paint: {
			"circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 7, 15, 11],
			"circle-color": "#10b981",
			"circle-stroke-width": 2.5,
			"circle-stroke-color": "#fff",
			"circle-opacity": 0.92,
		},
	});
}

function addInteractions(map: maplibregl.Map) {
	const popup = new maplibregl.Popup({ closeButton: false, maxWidth: "260px", className: "alerta-popup" });

	map.on("click", "incident-points", (e) => {
		const f = e.features?.[0];
		if (!f) return;
		popup
			.setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
			.setHTML(incidentHTML(f.properties as Record<string, string>))
			.addTo(map);
	});

	map.on("click", "safe-points", (e) => {
		const f = e.features?.[0];
		if (!f) return;
		popup
			.setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
			.setHTML(safeHTML(f.properties as Record<string, string>))
			.addTo(map);
	});

	map.on("click", "clusters", (e) => {
		const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
		const clusterId = features[0]?.properties?.cluster_id;
		if (!clusterId) return;
		(map.getSource("incidents") as maplibregl.GeoJSONSource).getClusterExpansionZoom(
			clusterId,
			(err, zoom) => {
				if (err) return;
				map.easeTo({
					center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
					zoom:   (zoom ?? 14) + 0.5,
				});
			},
		);
	});

	for (const layer of ["incident-points", "safe-points", "clusters"]) {
		map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
		map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
	}
}

// ─── Componente ───────────────────────────────────────────────────────────────
export interface MapboxMapProps {
	incidents:      Incident[];
	safePlaces:     SafePlace[];
	showIncidents:  boolean;
	showSafePlaces: boolean;
}

export function MapboxMap({ incidents, safePlaces, showIncidents, showSafePlaces }: MapboxMapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef       = useRef<maplibregl.Map | null>(null);
	const loadedRef    = useRef(false);
	const { resolvedTheme } = useTheme();

	// ── Inicializar ──────────────────────────────────────────────────────────
	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;

		const map = new maplibregl.Map({
			container: containerRef.current,
			style:     resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE,
			center:    CABA_CENTER,
			zoom:      12,
			attributionControl: false,
		});

		map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
		map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), "bottom-right");
		map.addControl(new maplibregl.AttributionControl({ compact: true }));

		map.on("load", () => {
			// ← Clave: resize para que el canvas tome las dimensiones reales del contenedor
			map.resize();
			loadedRef.current = true;
			addSources(map);
			addLayers(map);
			addInteractions(map);
			(map.getSource("incidents") as maplibregl.GeoJSONSource).setData(toIncidentsGeoJSON(incidents));
			(map.getSource("safe-places") as maplibregl.GeoJSONSource).setData(toSafePlacesGeoJSON(safePlaces));
		});

		mapRef.current = map;

		// ResizeObserver para cuando el contenedor cambia de tamaño
		const ro = new ResizeObserver(() => mapRef.current?.resize());
		ro.observe(containerRef.current);

		return () => {
			ro.disconnect();
			loadedRef.current = false;
			map.remove();
			mapRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Actualizar datos ─────────────────────────────────────────────────────
	useEffect(() => {
		if (!mapRef.current || !loadedRef.current) return;
		(mapRef.current.getSource("incidents") as maplibregl.GeoJSONSource | undefined)
			?.setData(toIncidentsGeoJSON(incidents));
	}, [incidents]);

	useEffect(() => {
		if (!mapRef.current || !loadedRef.current) return;
		(mapRef.current.getSource("safe-places") as maplibregl.GeoJSONSource | undefined)
			?.setData(toSafePlacesGeoJSON(safePlaces));
	}, [safePlaces]);

	// ── Visibilidad de capas ─────────────────────────────────────────────────
	useEffect(() => {
		if (!mapRef.current || !loadedRef.current) return;
		const v = showIncidents ? "visible" : "none";
		for (const id of ["clusters", "cluster-halo", "cluster-count", "incident-points"]) {
			if (mapRef.current.getLayer(id)) mapRef.current.setLayoutProperty(id, "visibility", v);
		}
	}, [showIncidents]);

	useEffect(() => {
		if (!mapRef.current || !loadedRef.current) return;
		if (mapRef.current.getLayer("safe-points"))
			mapRef.current.setLayoutProperty("safe-points", "visibility", showSafePlaces ? "visible" : "none");
	}, [showSafePlaces]);

	// ── Dark / light mode ────────────────────────────────────────────────────
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !loadedRef.current) return;

		map.setStyle(resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE);

		map.once("styledata", () => {
			if (map.getSource("incidents")) return; // ya tiene las fuentes
			addSources(map);
			addLayers(map);
			(map.getSource("incidents") as maplibregl.GeoJSONSource).setData(toIncidentsGeoJSON(incidents));
			(map.getSource("safe-places") as maplibregl.GeoJSONSource).setData(toSafePlacesGeoJSON(safePlaces));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resolvedTheme]);

	return (
		<>
			{/* El div necesita w-full h-full además del absolute inset-0 del padre */}
			<div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
			<style>{`
				.alerta-popup .maplibregl-popup-content {
					border-radius: 12px;
					padding: 12px 14px;
					box-shadow: 0 4px 20px rgba(0,0,0,0.15);
					border: 1px solid rgba(0,0,0,0.06);
				}
				.alerta-popup .maplibregl-popup-tip { display: none; }
				.maplibregl-ctrl-bottom-right { bottom: 80px !important; }
			`}</style>
		</>
	);
}
