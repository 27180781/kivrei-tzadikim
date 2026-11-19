"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Place } from "@/app/api/places/route";
import { rankPlaces } from "@/lib/rank";
import { googleMapsUrl, wazeUrl } from "@/lib/nav";

const PlacesMap = dynamic(() => import("./PlacesMap"), { ssr: false, loading: () => <div className="h-64 card" /> });

type Here = { lat: number; lng: number };

async function reverseCity(here: Here): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=he&lat=${here.lat}&lon=${here.lng}`,
    );
    const j = await r.json();
    const a = j.address ?? {};
    return a.city ?? a.town ?? a.village ?? a.municipality ?? null;
  } catch {
    return null;
  }
}

export default function NavApp() {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [hebrewDate, setHebrewDate] = useState("");
  const [here, setHere] = useState<Here | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [outOfCity, setOutOfCity] = useState(false);
  const [query, setQuery] = useState("");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetch("/api/places").then((r) => r.json()).then((j) => {
      setPlaces(j.places);
      setHebrewDate(j.hebrewDate);
    });
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setGeoError("הדפדפן לא תומך באיתור מיקום."));
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError("לא התקבלה הרשאה למיקום. הרשימה מוצגת לפי שם."),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // זיהוי העיר הנוכחית פעם אחת כשמתקבל מיקום
  const haveHere = here != null;
  useEffect(() => {
    if (here && userCity == null) reverseCity(here).then(setUserCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haveHere]);

  const ranked = useMemo(
    () => (places ? rankPlaces(places, { here, userCity, outOfCity, query }) : []),
    [places, here, userCity, outOfCity, query],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">קברי צדיקים קרובים</h1>
        {hebrewDate && <span className="text-muted text-sm">{hebrewDate}</span>}
      </div>

      <input
        className="input text-lg"
        placeholder="🔍 חיפוש צדיק, מקום או עיר"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex gap-2 flex-wrap items-center">
        <button
          className={`btn ${outOfCity ? "btn-primary" : ""}`}
          onClick={() => setOutOfCity((v) => !v)}
          disabled={!here}
          title={!here ? "נדרש מיקום" : undefined}
          aria-pressed={outOfCity}
        >
          {outOfCity ? "✓ " : ""}מחוץ לעיר
        </button>
        <button className="btn" onClick={() => setShowMap((v) => !v)}>{showMap ? "הסתר מפה" : "הצג מפה"}</button>
        {here && (
          <span className="text-sm text-muted">
            {userCity ? `המיקום שלך: ${userCity}` : "המיקום שלך זוהה"}
            {outOfCity && " · מוסתרים קברים בעיר, חוץ מהילולות היום"}
          </span>
        )}
      </div>
      {geoError && <p className="text-sm text-muted">{geoError}</p>}

      {showMap && places && <PlacesMap places={ranked} here={here} />}

      {!places ? <p className="text-muted">טוען…</p> : (
        <ul className="flex flex-col gap-3">
          {ranked.map((p, i) => (
            <li key={p.id} className={`card p-4 flex flex-col gap-2 ${p.hillulaToday ? "ring-2 ring-accent" : ""}`}>
              {p.featured && i === 0 && <div className="text-xs font-bold text-accent">🕯️ הילולות היום</div>}
              {!p.featured && i > 0 && ranked[i - 1].featured && <div className="text-xs font-bold text-muted -mt-1">קרובים אליך</div>}
              <div className="flex justify-between gap-2">
                <Link href={`/tzadik/${p.slug}`} className="font-bold text-lg hover:text-accent">{p.name}</Link>
                {p.distance != null && <span className="text-sm text-muted whitespace-nowrap">{formatKm(p.distance)}</span>}
              </div>
              <div className="text-sm">📍 {p.siteName}</div>
              <div className="text-sm text-muted">
                {p.hillulaToday ? <b className="text-accent">ההילולה היום</b> : p.hillulaLabel ? `הילולה: ${p.hillulaLabel}` : null}
              </div>
              <div className="flex gap-2">
                <a className="btn btn-primary flex-1 justify-center" href={wazeUrl(p.lat, p.lng)} target="_blank" rel="noopener">Waze</a>
                <a className="btn flex-1 justify-center" href={googleMapsUrl(p.lat, p.lng)} target="_blank" rel="noopener">Google Maps</a>
              </div>
            </li>
          ))}
          {!ranked.length && <p className="text-muted">לא נמצאו תוצאות.</p>}
        </ul>
      )}
    </div>
  );
}

function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} מ׳` : `${km < 10 ? km.toFixed(1) : Math.round(km)} ק״מ`;
}
