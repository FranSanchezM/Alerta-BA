import { Phone, Heart, Scale, ExternalLink, MessageCircle, ChevronRight } from "lucide-react";
import { BottomNav, SideNav } from "@/components/bottom-nav";
import { PageHeader } from "@/components/page-header";
import { ColiFooter } from "@/components/coli-footer";

const emergency = [
	{ number: "144", label: "Violencia de género", sub: "Línea nacional, gratuita, 24 hs", color: "rose" },
	{ number: "911", label: "Emergencias", sub: "Policía / Bomberos / SAME", color: "red" },
	{ number: "0800 333 5254", label: "OFAVyT", sub: "Oficina de Asistencia a la Víctima", color: "blue" },
];

const psychological = [
	{
		name: "CUCAIBA — Asistencia psicológica",
		detail: "Orientación y acompañamiento gratuito",
		phone: "0800 222 1002",
		hours: "Lun–Vie 8:00–20:00",
		tag: "Gratuito",
	},
	{
		name: "Dirección de la Mujer CABA",
		detail: "Atención psicológica presencial y online",
		phone: "0800 666 8537",
		hours: "Lun–Vie 9:00–18:00",
		tag: "Gratuito",
	},
	{
		name: "Centro de Justicia de la Mujer",
		detail: "Acompañamiento integral para víctimas",
		phone: "0800 333 7867",
		hours: "Lun–Vie 8:00–19:00",
		tag: "Presencial / Online",
	},
];

const legal = [
	{
		name: "Patrocinio Jurídico CABA",
		detail: "Asesoramiento y representación legal gratuita",
		phone: "4305 7814",
		hours: "Lun–Vie 9:00–17:00",
		tag: "Gratuito",
	},
	{
		name: "Ministerio Público Fiscal",
		detail: "Denuncias penales y asistencia legal",
		phone: "0800 333 7742",
		hours: "Lun–Vie 8:00–20:00",
		tag: "Asesoramiento",
	},
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
	rose: { bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-700 dark:text-rose-300", border: "border-rose-100 dark:border-rose-900" },
	red: { bg: "bg-red-50 dark:bg-red-950/50", text: "text-red-700 dark:text-red-300", border: "border-red-100 dark:border-red-900" },
	blue: { bg: "bg-blue-50 dark:bg-blue-950/50", text: "text-blue-700 dark:text-blue-300", border: "border-blue-100 dark:border-blue-900" },
};

function SectionTitle({ icon: Icon, title, color }: { icon: typeof Heart; title: string; color: string }) {
	return (
		<div className={`flex items-center gap-2 mb-3 px-1`}>
			<div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
				<Icon className="w-4 h-4" />
			</div>
			<h2 className="font-bold text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wide">{title}</h2>
		</div>
	);
}

function AssistanceCard({ name, detail, phone, hours, tag }: { name: string; detail: string; phone: string; hours: string; tag: string }) {
	return (
		<div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
			<div>
				<div className="flex items-start justify-between gap-2">
					<div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{name}</div>
					<span className="text-[10px] px-2 py-0.5 bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900 rounded-full whitespace-nowrap font-medium">
						{tag}
					</span>
				</div>
				<div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{detail}</div>
			</div>
			<div className="flex items-center justify-between">
				<div className="text-xs text-gray-400 dark:text-gray-500">{hours}</div>
				<a
					href={`tel:${phone.replace(/\s/g, "")}`}
					className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-xl border border-blue-100 dark:border-blue-900"
				>
					<Phone className="w-3 h-3" />
					{phone}
				</a>
			</div>
		</div>
	);
}

export default function AsistenciaPage() {
	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
			<SideNav />

			<main className="flex-1 min-w-0">
				<div className="max-w-lg mx-auto md:max-w-2xl">
					<PageHeader
						title="Asistencia"
						subtitle="Acompañamiento psicológico, legal y líneas de ayuda"
						color="bg-blue-600 dark:bg-blue-950"
					/>

					<div className="p-4 space-y-6 mb-28 md:mb-8">
						{/* Emergency numbers */}
						<div>
							<SectionTitle icon={Phone} title="Líneas de emergencia" color="bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400" />
							<div className="space-y-2">
								{emergency.map(({ number, label, sub, color }) => {
									const c = colorMap[color];
									return (
										<a
											key={number}
											href={`tel:${number.replace(/\s/g, "")}`}
											className={`flex items-center gap-4 p-4 rounded-2xl border ${c.bg} ${c.border} group`}
										>
											<div className={`text-2xl font-black tracking-tight ${c.text}`}>{number}</div>
											<div className="flex-1 min-w-0">
												<div className={`font-semibold text-sm ${c.text}`}>{label}</div>
												<div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>
											</div>
											<Phone className={`w-5 h-5 ${c.text} shrink-0 group-hover:scale-110 transition-transform`} />
										</a>
									);
								})}
							</div>
						</div>

						{/* Psychological */}
						<div>
							<SectionTitle icon={Heart} title="Acompañamiento psicológico" color="bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400" />
							<div className="space-y-2">
								{psychological.map((item) => (
									<AssistanceCard key={item.name} {...item} />
								))}
							</div>
						</div>

						{/* Legal */}
						<div>
							<SectionTitle icon={Scale} title="Asesoramiento jurídico" color="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" />
							<div className="space-y-2">
								{legal.map((item) => (
									<AssistanceCard key={item.name} {...item} />
								))}
							</div>
						</div>

						{/* Chat support */}
						<div className="bg-gradient-to-br from-violet-600 to-violet-800 dark:from-violet-900 dark:to-violet-950 rounded-2xl p-5 text-white">
							<div className="flex items-center gap-2 mb-2">
								<MessageCircle className="w-5 h-5" />
								<div className="font-bold">¿Necesitás hablar con alguien?</div>
							</div>
							<p className="text-sm text-violet-200 mb-4">
								Accedé al chat de contención emocional online, disponible de lunes a viernes.
							</p>
							<button className="flex items-center gap-2 bg-white text-violet-700 font-semibold text-sm px-4 py-2.5 rounded-xl">
								Iniciar chat <ExternalLink className="w-4 h-4" />
							</button>
						</div>

						{/* Rights link */}
						<a
							href="/informacion"
							className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
						>
							<div>
								<div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
									Conocé tus derechos
								</div>
								<div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
									Marco legal, cómo denunciar, qué hacer
								</div>
							</div>
							<ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
						</a>
					</div>
				</div>
				<ColiFooter />
			</main>

			<BottomNav />
		</div>
	);
}
