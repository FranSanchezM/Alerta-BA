import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "AlertaBA",
		short_name: "AlertaBA",
		description: "Reportá acoso callejero en tiempo real. Encontrá puntos seguros y asistencia en CABA.",
		start_url: "/",
		display: "standalone",
		background_color: "#030712",
		theme_color: "#7c3aed",
		orientation: "portrait",
		categories: ["social", "safety"],
		icons: [
			{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
			{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
			{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
		],
		shortcuts: [
			{
				name: "Hacer una denuncia",
				url: "/denunciar",
				description: "Reportá un incidente ahora",
			},
			{
				name: "Ver mapa",
				url: "/mapa",
				description: "Zonas de riesgo en CABA",
			},
		],
	};
}
