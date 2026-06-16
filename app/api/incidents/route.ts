import { NextRequest, NextResponse } from "next/server";
import type { CreateIncidentPayload, Incident } from "@/lib/types";

const SUPABASE_CONFIGURED =
	!!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock data — fallback para presentación sin Supabase
const MOCK_INCIDENTS: Incident[] = [
	{ id: "1", created_at: new Date(Date.now() - 12 * 60000).toISOString(),       type: "verbal",       description: "Comentarios sobre mi ropa", latitude: -34.5861, longitude: -58.4183, address: "Av. Santa Fe 3400",     neighborhood: "Palermo",     anonymous: true },
	{ id: "2", created_at: new Date(Date.now() - 28 * 60000).toISOString(),       type: "seguimiento",  description: null,                        latitude: -34.6046, longitude: -58.3840, address: "Av. Corrientes 1200",   neighborhood: "San Nicolás", anonymous: true },
	{ id: "3", created_at: new Date(Date.now() - 60 * 60000).toISOString(),       type: "exhibicionismo",description: null,                       latitude: -34.6230, longitude: -58.3720, address: "Defensa 900",           neighborhood: "San Telmo",   anonymous: true },
	{ id: "4", created_at: new Date(Date.now() - 90 * 60000).toISOString(),       type: "contacto",     description: "En el colectivo",           latitude: -34.6099, longitude: -58.4115, address: "Av. Rivadavia 3200",   neighborhood: "Balvanera",   anonymous: true },
	{ id: "5", created_at: new Date(Date.now() - 160 * 60000).toISOString(),      type: "verbal",       description: null,                        latitude: -34.5882, longitude: -58.3943, address: "Callao 1800",           neighborhood: "Recoleta",    anonymous: true },
	{ id: "6", created_at: new Date(Date.now() - 3 * 3600000).toISOString(),      type: "seguimiento",  description: "Me siguió durante 6 cuadras",latitude: -34.6118, longitude: -58.4268, address: "Medrano 400",          neighborhood: "Almagro",     anonymous: false },
	{ id: "7", created_at: new Date(Date.now() - 5 * 3600000).toISOString(),      type: "fotografia",   description: null,                        latitude: -34.5584, longitude: -58.4569, address: "Av. Cabildo 2100",      neighborhood: "Belgrano",    anonymous: true },
	{ id: "8", created_at: new Date(Date.now() - 6 * 3600000).toISOString(),      type: "verbal",       description: "Al salir del trabajo",      latitude: -34.6172, longitude: -58.4440, address: "Av. Rivadavia 5400",   neighborhood: "Caballito",   anonymous: true },
	{ id: "9", created_at: new Date(Date.now() - 8 * 3600000).toISOString(),      type: "intimidacion", description: null,                        latitude: -34.6077, longitude: -58.3783, address: "Lavalle 800",           neighborhood: "San Nicolás", anonymous: true },
	{ id: "10", created_at: new Date(Date.now() - 24 * 3600000).toISOString(),    type: "verbal",       description: null,                        latitude: -34.5904, longitude: -58.4267, address: "Thames 1800",           neighborhood: "Palermo",     anonymous: true },
	{ id: "11", created_at: new Date(Date.now() - 26 * 3600000).toISOString(),    type: "contacto",     description: null,                        latitude: -34.6312, longitude: -58.4651, address: "Av. Rivadavia 7100",   neighborhood: "Flores",      anonymous: true },
	{ id: "12", created_at: new Date(Date.now() - 30 * 3600000).toISOString(),    type: "seguimiento",  description: "Desde Retiro hasta Lavalle", latitude: -34.5934, longitude: -58.3763, address: "Leandro N. Alem 700", neighborhood: "Retiro",      anonymous: true },
];

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const limit = parseInt(searchParams.get("limit") ?? "50");
	const lat = searchParams.get("lat");
	const lng = searchParams.get("lng");
	const radius = parseInt(searchParams.get("radius") ?? "2000");

	if (!SUPABASE_CONFIGURED) {
		return NextResponse.json(MOCK_INCIDENTS.slice(0, limit));
	}

	const { createServerClient } = await import("@/lib/supabase-server");
	const supabase = createServerClient();

	let query;

	if (lat && lng) {
		// Spatial query using PostGIS function
		const { data, error } = await supabase.rpc("incidents_near", {
			lat: parseFloat(lat),
			lng: parseFloat(lng),
			radius_m: radius,
		});
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json((data ?? []).slice(0, limit));
	}

	const { data, error } = await supabase
		.from("incidents")
		.select("id, created_at, type, description, latitude, longitude, address, neighborhood, anonymous")
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
	const body: CreateIncidentPayload = await request.json();

	// Validate
	const validTypes = ["verbal", "seguimiento", "exhibicionismo", "contacto", "fotografia", "intimidacion", "otro"];
	if (!validTypes.includes(body.type)) {
		return NextResponse.json({ error: "Tipo de incidente inválido" }, { status: 400 });
	}
	if (!body.latitude || !body.longitude) {
		return NextResponse.json({ error: "Ubicación requerida" }, { status: 400 });
	}

	if (!SUPABASE_CONFIGURED) {
		// Mock response for demo
		const mockIncident: Incident = {
			id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
			type: body.type,
			description: body.description ?? null,
			latitude: body.latitude,
			longitude: body.longitude,
			address: body.address ?? null,
			neighborhood: body.neighborhood ?? null,
			anonymous: body.anonymous,
		};
		return NextResponse.json(mockIncident, { status: 201 });
	}

	const { createServerClient } = await import("@/lib/supabase-server");
	const supabase = createServerClient();

	const { data, error } = await supabase
		.from("incidents")
		.insert({
			type: body.type,
			description: body.description ?? null,
			latitude: body.latitude,
			longitude: body.longitude,
			address: body.address ?? null,
			neighborhood: body.neighborhood ?? null,
			anonymous: body.anonymous,
		})
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json(data, { status: 201 });
}
