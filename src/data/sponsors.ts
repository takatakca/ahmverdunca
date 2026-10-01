export interface Sponsor {
  name: string;
  website?: string;
  logoApproved: boolean;
}

export const SPONSORS: Sponsor[] = [
  { name: "Desjardins — Caisse de L'Île-des-Sœurs–Verdun", logoApproved: false },
  { name: "Explore Verdun / IDS", logoApproved: false },
  { name: "Lait au chocolat", logoApproved: false },
  { name: "Maxi Verdun", logoApproved: false },
  { name: "McDonald's", logoApproved: false },
  { name: "RONA — Promenade Wellington", logoApproved: false },
  { name: "St-Hubert", logoApproved: false },
  { name: "Arrondissement de Verdun", logoApproved: false },
  { name: "Député du Québec", logoApproved: false },
  { name: "Bagel St-Lo", logoApproved: false },
  { name: "Club Richelieu", logoApproved: false },
  { name: "Librairie de Verdun", logoApproved: false },
  { name: "Sport Campus", logoApproved: false },
];
