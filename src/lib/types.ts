export type Site = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  directions: string | null;
  public_transport: string | null;
  opening_hours: string | null;
  accessibility: string | null;
  notes: string | null;
};

export type Tzadik = {
  id: string;
  ivr_code: number | null;
  name: string;
  aka: string[] | null;
  slug: string;
  bio: string | null;
  bio_short: string | null;
  hebrew_death_day: number | null;
  hebrew_death_month: number | null;
  death_year_hebrew: number | null;
  site_id: string | null;
  is_published: boolean;
  cover_photo_id?: string | null;
};

export type Photo = {
  id: string;
  tzadik_id: string | null;
  site_id: string | null;
  url: string;
  caption: string | null;
  sort: number;
};

export type HillulaEvent = {
  id: string;
  tzadik_id: string | null;
  site_id: string | null;
  starts_at: string;
  location_text: string | null;
  organizer: string | null;
  contact_phone: string | null;
  details: string | null;
  status: "scheduled" | "updated" | "cancelled";
  updated_at: string;
};

export type TzadikWithSite = Tzadik & { site: Site | null };
