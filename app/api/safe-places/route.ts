import { NextRequest, NextResponse } from "next/server";
import type { SafePlace } from "@/lib/types";

const SUPABASE_CONFIGURED =
	!!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MOCK_SAFE_PLACES: SafePlace[] = [
	{ id: "1",  name: "Farmacia Del Pueblo Corrientes",     category: "farmacia", address: "Av. Corrientes 1456",  neighborhood: "San Nicolás", latitude: -34.6038, longitude: -58.3851, phone: "4371-2200", hours: "Lun–Dom 8:00–22:00",   distance_m: 120 },
	{ id: "2",  name: "Farmacia Suizo Argentina",           category: "farmacia", address: "Av. Pueyrredón 1401", neighborhood: "Recoleta",    latitude: -34.5902, longitude: -58.4007, phone: "4821-3300", hours: "Lun–Dom 8:00–23:30",   distance_m: 230 },
	{ id: "3",  name: "Kiosco El Centro",                   category: "kiosco",   address: "Lavalle 890",          neighborhood: "San Nicolás", latitude: -34.6054, longitude: -58.3817, phone: null,        hours: "0:00–24:00",           distance_m: 310 },
	{ id: "4",  name: "Café Literario Uruguay",             category: "cafe",     address: "Uruguay 542",          neighborhood: "San Nicolás", latitude: -34.6041, longitude: -58.3882, phone: "4371-8800", hours: "Lun–Dom 8:00–23:00",   distance_m: 420 },
	{ id: "5",  name: "El Ateneo Grand Splendid",           category: "libreria", address: "Av. Santa Fe 1860",   neighborhood: "Recoleta",    latitude: -34.5962, longitude: -58.3933, phone: "4813-6052", hours: "Lun–Dom 9:00–22:00",   distance_m: 550 },
	{ id: "6",  name: "Banco Nación Microcentro",           category: "banco",    address: "San Martín 137",       neighborhood: "San Nicolás", latitude: -34.6033, longitude: -58.3710, phone: "0810-666-4444","hours": "Lun–Vie 10:00–15:00", distance_m: 620 },
	{ id: "7",  name: "Farmacia Santa Fe Palermo",          category: "farmacia", address: "Av. Santa Fe 3598",   neighborhood: "Palermo",     latitude: -34.5869, longitude: -58.4197, phone: "4831-1100", hours: "Lun–Dom 0:00–24:00",   distance_m: 780 },
	{ id: "8",  name: "Kiosco Palermo Hollywood",           category: "kiosco",   address: "Thames 1748",          neighborhood: "Palermo",     latitude: -34.5894, longitude: -58.4254, phone: null,        hours: "0:00–24:00",           distance_m: 850 },
	{ id: "9",  name: "Café Martínez Palermo",              category: "cafe",     address: "Av. Santa Fe 3701",   neighborhood: "Palermo",     latitude: -34.5858, longitude: -58.4218, phone: "4833-2200", hours: "Lun–Dom 7:00–23:00",   distance_m: 920 },
	{ id: "10", name: "Librería Hernández Corrientes",      category: "libreria", address: "Av. Corrientes 1578", neighborhood: "San Nicolás", latitude: -34.6042, longitude: -58.3861, phone: "4371-5800", hours: "Lun–Sáb 9:00–21:00",  distance_m: 1050 },
];

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const lat = searchParams.get("lat");
	const lng = searchParams.get("lng");
	const radius = parseInt(searchParams.get("radius") ?? "1500");
	const category = searchParams.get("category");

	if (!SUPABASE_CONFIGURED) {
		let result = MOCK_SAFE_PLACES;
		if (category && category !== "todos") {
			result = result.filter((p) => p.category === category);
		}
		return NextResponse.json(result);
	}

	const { createServerClient } = await import("@/lib/supabase-server");
	const supabase = createServerClient();

	if (lat && lng) {
		const { data, error } = await supabase.rpc("safe_places_near", {
			lat: parseFloat(lat),
			lng: parseFloat(lng),
			radius_m: radius,
		});
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });

		let result = data ?? [];
		if (category && category !== "todos") {
			result = result.filter((p: SafePlace) => p.category === category);
		}
		return NextResponse.json(result);
	}

	let query = supabase
		.from("safe_places")
		.select("id, name, category, address, neighborhood, latitude, longitude, phone, hours")
		.eq("is_active", true);

	if (category && category !== "todos") {
		query = query.eq("category", category);
	}

	const { data, error } = await query.order("name");
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}
