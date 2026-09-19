import type { Localized } from "@/lib/i18n";

export interface Arena {
  slug: string;
  name: string;
  borough: Localized;
  /** Address entered from public knowledge — MUST be verified before publication. */
  address: string;
  addressVerified: boolean;
  website?: string;
  facilities?: Localized;
  zone: "verdun" | "sud-ouest" | "ouest" | "centre" | "nord";
}

export const ARENAS: Arena[] = [
  { slug: "auditorium-de-verdun", name: "Auditorium de Verdun", borough: { fr: "Verdun", en: "Verdun" }, address: "4110, boulevard LaSalle, Verdun (Québec)", addressVerified: false, website: "https://montreal.ca/lieux/auditorium-de-verdun", facilities: { fr: "Aréna principal de l'association. Deux glaces (Auditorium et Denis-Savard).", en: "Main arena of the association. Two rinks (Auditorium and Denis-Savard)." }, zone: "verdun" },
  { slug: "samuel-moskovitch", name: "Aréna Samuel Moskovitch", borough: { fr: "Côte Saint-Luc", en: "Côte Saint-Luc" }, address: "6985, chemin Mackle, Côte Saint-Luc (Québec)", addressVerified: false, zone: "ouest" },
  { slug: "legion-memorial", name: "Legion Memorial Rink", borough: { fr: "Montréal-Ouest", en: "Montreal West" }, address: "220, avenue Bedbrook, Montréal-Ouest (Québec)", addressVerified: false, zone: "ouest" },
  { slug: "pete-morin", name: "Aréna Pete-Morin", borough: { fr: "Lachine", en: "Lachine" }, address: "1925, rue Saint-Antoine, Lachine (Québec)", addressVerified: false, zone: "sud-ouest" },
  { slug: "martin-lapointe", name: "Aréna Martin-Lapointe", borough: { fr: "Lachine", en: "Lachine" }, address: "3175, rue Remembrance, Lachine (Québec)", addressVerified: false, zone: "sud-ouest" },
  { slug: "jacques-lemaire", name: "Aréna Jacques-Lemaire", borough: { fr: "LaSalle", en: "LaSalle" }, address: "8600, boulevard Champlain, LaSalle (Québec)", addressVerified: false, zone: "sud-ouest" },
  { slug: "dollard-saint-laurent", name: "Aréna Dollard-St-Laurent", borough: { fr: "LaSalle", en: "LaSalle" }, address: "707, 75e Avenue, LaSalle (Québec)", addressVerified: false, zone: "sud-ouest" },
  { slug: "outremont", name: "Aréna d'Outremont", borough: { fr: "Outremont", en: "Outremont" }, address: "999, avenue McEachran, Outremont (Québec)", addressVerified: false, zone: "centre" },
  { slug: "mont-royal", name: "Aréna de Mont-Royal", borough: { fr: "Ville de Mont-Royal", en: "Town of Mount Royal" }, address: "1050, chemin Dunkirk, Mont-Royal (Québec)", addressVerified: false, zone: "centre" },
  { slug: "raymond-bourque", name: "Aréna Raymond-Bourque", borough: { fr: "Saint-Laurent", en: "Saint-Laurent" }, address: "2345, boulevard Thimens, Saint-Laurent (Québec)", addressVerified: false, zone: "nord" },
  { slug: "cegep-saint-laurent", name: "Aréna du Cégep de Saint-Laurent", borough: { fr: "Saint-Laurent", en: "Saint-Laurent" }, address: "625, avenue Sainte-Croix, Saint-Laurent (Québec)", addressVerified: false, zone: "nord" },
  { slug: "westmount", name: "Centre récréatif de Westmount", borough: { fr: "Westmount", en: "Westmount" }, address: "4675, rue Sainte-Catherine Ouest, Westmount (Québec)", addressVerified: false, zone: "centre" },
];

export const ARENA_ZONES: { id: Arena["zone"]; label: Localized }[] = [
  { id: "verdun", label: { fr: "Verdun", en: "Verdun" } },
  { id: "sud-ouest", label: { fr: "Sud-Ouest / LaSalle / Lachine", en: "South-West / LaSalle / Lachine" } },
  { id: "ouest", label: { fr: "Ouest-de-l'Île", en: "West Island" } },
  { id: "centre", label: { fr: "Centre", en: "Central" } },
  { id: "nord", label: { fr: "Saint-Laurent", en: "Saint-Laurent" } },
];

export const getArena = (slug: string) => ARENAS.find((a) => a.slug === slug);
