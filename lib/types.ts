export type IncidentType =
	| "verbal"
	| "seguimiento"
	| "exhibicionismo"
	| "contacto"
	| "fotografia"
	| "intimidacion"
	| "otro";

export type SafePlaceCategory =
	| "farmacia"
	| "kiosco"
	| "cafe"
	| "libreria"
	| "banco"
	| "otro";

export interface Incident {
	id: string;
	created_at: string;
	type: IncidentType;
	description: string | null;
	latitude: number;
	longitude: number;
	address: string | null;
	neighborhood: string | null;
	anonymous: boolean;
}

export interface SafePlace {
	id: string;
	name: string;
	category: SafePlaceCategory;
	address: string;
	neighborhood: string | null;
	latitude: number;
	longitude: number;
	phone: string | null;
	hours: string | null;
	distance_m?: number;
}

export interface Stats {
	incidents_today: number;
	risk_zones: number;
	safe_places: number;
}

export interface CreateIncidentPayload {
	type: IncidentType;
	description?: string;
	latitude: number;
	longitude: number;
	address?: string;
	neighborhood?: string;
	anonymous: boolean;
}
