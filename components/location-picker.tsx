"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import maplibregl from "maplibre-gl";

const LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DARK_STYLE  = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const CABA_CENTER: [number, number] = [-58.3816, -34.6037];

async function reverseGeocode(lat: number, lng: number): Promise<string> {
	try {
		const res = await fetch(
			`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
			{ headers: { "User-Agent": "AlertaBA/1.0" } },
		);
		const data = await res.json();
		const { road, house_number, suburb, city_district } = data.address ?? {};
		const parts = [road, house_number, suburb ?? city_district].filter(Boolean);
		return parts.length ? parts.join(" ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
	} catch {
		return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
	}
}

interface Props {
	lat: number | null;
	lng: number | null;
	onLocationChange: (lat: number, lng: number, address: string) => void;
}

export function LocationPicker({ lat, lng, onLocationChange }: Props) {
	const containerRef  = useRef<HTMLDivElement>(null);
	const mapRef        = useRef<maplibregl.Map | null>(null);
	const markerRef     = useRef<maplibregl.Marker | null>(null);
	const { resolvedTheme } = useTheme();
	const [geocoding, setGeocoding] = useState(false);

	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;

		const center: [number, number] = lat && lng ? [lng, lat] : CABA_CENTER;

		const map = new maplibregl.Map({
			container: containerRef.current,
			style: resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE,
			center,
			zoom: 15,
			attributionControl: false,
		});

		map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

		// Marker draggable
		const marker = new maplibregl.Marker({ color: "#e11d48", draggable: true })
			.setLngLat(center)
			.addTo(map);

		const onDragEnd = async () => {
			const { lng: mLng, lat: mLat } = marker.getLngLat();
			setGeocoding(true);
			const address = await reverseGeocode(mLat, mLng);
			setGeocoding(false);
			onLocationChange(mLat, mLng, address);
		};

		marker.on("dragend", onDragEnd);

		map.on("load", () => map.resize());

		const ro = new ResizeObserver(() => map.resize());
		ro.observe(containerRef.current!);

		mapRef.current = map;
		markerRef.current = marker;

		return () => {
			ro.disconnect();
			map.remove();
			mapRef.current = null;
			markerRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Mover marker si cambian las coords externamente (GPS)
	useEffect(() => {
		if (lat && lng && markerRef.current && mapRef.current) {
			markerRef.current.setLngLat([lng, lat]);
			mapRef.current.easeTo({ center: [lng, lat], zoom: 15 });
		}
	}, [lat, lng]);

	return (
		<div className="relative">
			<div ref={containerRef} className="w-full h-52 rounded-2xl overflow-hidden" />
			{geocoding && (
				<div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 rounded-full px-3 py-1 text-xs text-gray-500 shadow">
					Buscando dirección...
				</div>
			)}
			<div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-400 shadow pointer-events-none">
				Arrastrá el pin para ajustar
			</div>
		</div>
	);
}
