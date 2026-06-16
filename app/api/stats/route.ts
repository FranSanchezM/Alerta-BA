import { NextResponse } from "next/server";
import type { Stats } from "@/lib/types";

const SUPABASE_CONFIGURED =
	!!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
	if (!SUPABASE_CONFIGURED) {
		const mock: Stats = {
			incidents_today: 47,
			risk_zones: 12,
			safe_places: 89,
		};
		return NextResponse.json(mock);
	}

	const { createServerClient } = await import("@/lib/supabase-server");
	const supabase = createServerClient();

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	const [incidentsResult, safePlacesResult] = await Promise.all([
		supabase
			.from("incidents")
			.select("neighborhood", { count: "exact" })
			.gte("created_at", todayStart.toISOString()),
		supabase
			.from("safe_places")
			.select("id", { count: "exact" })
			.eq("is_active", true),
	]);

	const incidentsToday = incidentsResult.count ?? 0;
	const safePlacesCount = safePlacesResult.count ?? 0;

	// Risk zones: neighborhoods with 3+ incidents in the last 30 days
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
	const { data: neighborhoodData } = await supabase
		.from("incidents")
		.select("neighborhood")
		.gte("created_at", thirtyDaysAgo)
		.not("neighborhood", "is", null);

	const neighborhoodCounts = (neighborhoodData ?? []).reduce(
		(acc, { neighborhood }) => {
			if (neighborhood) acc[neighborhood] = (acc[neighborhood] ?? 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const riskZones = Object.values(neighborhoodCounts).filter((count) => count >= 3).length;

	const stats: Stats = {
		incidents_today: incidentsToday,
		risk_zones: riskZones,
		safe_places: safePlacesCount,
	};

	return NextResponse.json(stats);
}
