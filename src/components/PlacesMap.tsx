"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Place } from "@/app/api/places/route";
import { wazeUrl } from "@/lib/nav";

export default function PlacesMap({ places, here }: { places: Place[]; here: { lat: number; lng: number } | null }) {
  const center: [number, number] = here ? [here.lat, here.lng] : [31.9, 35.0];
  return (
    <div className="h-80 rounded-2xl overflow-hidden border border-border">
      <MapContainer center={center} zoom={here ? 10 : 7} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {here && <CircleMarker center={[here.lat, here.lng]} radius={7} pathOptions={{ color: "#2563eb", fillOpacity: 0.9 }} />}
        {places.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={p.hillulaToday ? 10 : 7}
            pathOptions={{ color: p.hillulaToday ? "#b45309" : "#6b6257", fillOpacity: 0.8 }}
          >
            <Popup>
              <b>{p.name}</b><br />{p.siteName}<br />
              <a href={wazeUrl(p.lat, p.lng)} target="_blank" rel="noopener">ניווט ב-Waze</a>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
