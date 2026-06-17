"use client";

import { useState } from "react";
import {
	BookOpen,
	Scale,
	Users,
	Eye,
	ChevronDown,
	AlertCircle,
	ShieldCheck,
	MessageCircle,
} from "lucide-react";
import { BottomNav, SideNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { ColiFooter } from "@/components/coli-footer";
import { cn } from "@/lib/utils";
import Link from "next/link";

const sections = [
	{
		id: "que-es",
		icon: BookOpen,
		iconColor: "bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400",
		title: "¿Qué es el acoso callejero?",
		content: [
			"El acoso callejero es cualquier acto de acercamiento no deseado en la vía pública que genera incomodidad, miedo o malestar en la persona que lo recibe. Puede ser verbal, físico o visual.",
			"Incluye piropos no solicitados, comentarios sobre el cuerpo o apariencia, silbidos, seguimiento, exhibicionismo, fotografías sin consentimiento, y contacto físico no deseado.",
			"No es un halago. Es una forma de violencia de género que ocupa y limita el espacio público de las personas.",
		],
		examples: ["Comentarios sobre tu cuerpo", "Silbidos o sonidos intimidantes", "Seguirte o perseguirte", "Fotografiarte sin permiso", "Tocarte sin consentimiento", "Exhibicionismo"],
	},
	{
		id: "marco-legal",
		icon: Scale,
		iconColor: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
		title: "Marco legal en Argentina",
		content: [
			"La Ley Nacional N° 27.501 incorporó el acoso callejero como una forma de violencia de género en la Ley N° 26.485 de Protección Integral a las Mujeres.",
			"En la Ciudad de Buenos Aires, la Ley N° 6128 tipifica el acoso sexual en espacios públicos y privados de acceso público como contravención. Establece multas y sanciones para quienes lo cometan.",
			"El acoso callejero puede ser denunciado ante la Fiscalía Contravencional correspondiente o en cualquier comisaría.",
		],
		examples: null,
	},
	{
		id: "derechos",
		icon: ShieldCheck,
		iconColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
		title: "Derechos de las víctimas",
		content: [
			"Toda persona que sufre acoso callejero tiene derecho a ser escuchada y recibir asistencia del Estado.",
			"Tenés derecho a hacer la denuncia de forma anónima o con reserva de identidad. También a recibir acompañamiento psicológico y legal de forma gratuita.",
		],
		examples: [
			"Acceder a asistencia psicológica gratuita",
			"Recibir asesoramiento legal sin costo",
			"Hacer la denuncia en forma anónima",
			"Ser tratada con respeto durante el proceso",
			"Conocer el estado de tu denuncia",
			"No ser culpabilizada por lo ocurrido",
		],
	},
	{
		id: "como-denunciar",
		icon: AlertCircle,
		iconColor: "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400",
		title: "Cómo hacer una denuncia",
		content: [
			"Podés denunciar de varias formas: a través de esta aplicación (generando datos para el mapa), en la Fiscalía Contravencional más cercana, o llamando a la línea 144.",
			"Si el incidente es reciente, intentá recordar o anotar la descripción del agresor, lugar exacto, hora y si había testigos.",
			"No es necesario contar con pruebas para hacer la denuncia, pero si tenés fotos, videos o testigos, esto puede ayudar.",
		],
		examples: null,
	},
	{
		id: "testigo",
		icon: Eye,
		iconColor: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
		title: "¿Qué hacer si sos testigo?",
		content: [
			"Si presenciás una situación de acoso callejero, podés actuar de manera segura para ayudar sin poner en riesgo tu integridad.",
			"Técnica de la distracción: acercate a la persona que está siendo acosada y fingí conocerla. Preguntale '¿Cómo estás? ¡Qué casualidad encontrarte!', ignorando al acosador.",
			"No confrontes directamente al agresor si podés evitarlo. Priorizá la seguridad de la víctima.",
		],
		examples: [
			"Interponerte entre la víctima y el agresor de forma segura",
			"Usar la técnica de la distracción",
			"Pedir ayuda a otras personas cercanas",
			"Llamar al 911 si hay peligro",
			"Quedarte con la víctima hasta que se sienta segura",
			"Ofrecer acompañarla a un lugar seguro",
		],
	},
	{
		id: "prevencion",
		icon: Users,
		iconColor: "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400",
		title: "Prevención colectiva",
		content: [
			"El acoso callejero es un problema social que requiere soluciones colectivas. La educación y la visibilización son herramientas fundamentales.",
			"Hablar sobre el tema en familia, escuelas y comunidades ayuda a deconstruir los comportamientos que normalizan el acoso.",
			"Comercios y organizaciones pueden adherirse a la red de puntos seguros para ofrecer refugio a personas en situación de acoso.",
		],
		examples: null,
	},
];

function AccordionItem({ section, isOpen, onToggle }: { section: typeof sections[0]; isOpen: boolean; onToggle: () => void }) {
	const Icon = section.icon;
	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
			<button
				onClick={onToggle}
				className="w-full flex items-center gap-3 p-4 text-left"
			>
				<div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", section.iconColor)}>
					<Icon className="w-4 h-4" />
				</div>
				<span className="flex-1 font-semibold text-sm text-gray-900 dark:text-gray-100">{section.title}</span>
				<ChevronDown className={cn("w-4 h-4 text-gray-400 shrink-0 transition-transform", isOpen && "rotate-180")} />
			</button>

			{isOpen && (
				<div className="px-4 pb-4 space-y-3 border-t border-gray-50 dark:border-gray-800 pt-3">
					{section.content.map((para, i) => (
						<p key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{para}</p>
					))}
					{section.examples && (
						<ul className="mt-2 space-y-1.5">
							{section.examples.map((ex) => (
								<li key={ex} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
									<div className="w-1.5 h-1.5 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
									{ex}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}

export default function InformacionPage() {
	const [openSection, setOpenSection] = useState<string | null>("que-es");

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
			<SideNav />

			<main className="flex-1 min-w-0">
				<div className="max-w-lg mx-auto md:max-w-2xl">
					<PageHeader
						title="Información y prevención"
						subtitle="Conocé tus derechos y cómo actuar"
						color="bg-violet-700 dark:bg-violet-950"
					/>

					<div className="p-4 space-y-3 mb-28 md:mb-8">
						{/* Intro card */}
						<div className="bg-violet-50 dark:bg-violet-950/50 rounded-2xl border border-violet-100 dark:border-violet-900 p-4 flex items-start gap-3">
							<MessageCircle className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
							<p className="text-sm text-violet-800 dark:text-violet-300 leading-relaxed">
								El acoso callejero es una forma de violencia de género. Conocer tus derechos y cómo actuar hace la diferencia.
							</p>
						</div>

						{/* Accordion */}
						{sections.map((section) => (
							<AccordionItem
								key={section.id}
								section={section}
								isOpen={openSection === section.id}
								onToggle={() => setOpenSection(openSection === section.id ? null : section.id)}
							/>
						))}

						{/* CTA */}
						<div className="grid grid-cols-2 gap-3 pt-2">
							<Link
								href="/denunciar"
								className="flex flex-col items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900 rounded-2xl text-center"
							>
								<AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
								<span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Hacer una denuncia</span>
							</Link>
							<Link
								href="/asistencia"
								className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-2xl text-center"
							>
								<ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
								<span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Pedir asistencia</span>
							</Link>
						</div>
					</div>
				</div>
				<ColiFooter />
			</main>

			<BottomNav />
		</div>
	);
}
