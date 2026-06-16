import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
	title: "AlertaBA — Reportá acoso callejero",
	description:
		"Reportá hechos de acoso en tiempo real, encontrá puntos seguros y accedé a asistencia psicológica y legal.",
	keywords: ["acoso callejero", "seguridad", "denuncia", "CABA", "Buenos Aires"],
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#7c3aed" },
		{ media: "(prefers-color-scheme: dark)", color: "#1a0533" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body className="bg-gray-50 dark:bg-gray-950 font-sans antialiased transition-colors">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
