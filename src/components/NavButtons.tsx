import { googleMapsUrl, wazeUrl } from "@/lib/nav";

export default function NavButtons({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="flex gap-2 text-sm">
      <a className="btn" href={wazeUrl(lat, lng)} target="_blank" rel="noopener">ניווט ב-Waze</a>
      <a className="btn" href={googleMapsUrl(lat, lng)} target="_blank" rel="noopener">Google Maps</a>
    </div>
  );
}
