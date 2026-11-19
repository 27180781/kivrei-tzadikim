import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "קברי צדיקים: ניווט והילולות",
    short_name: "קברי צדיקים",
    description: "ניווט לקברי צדיקים, הילולות היום וסעודות הילולה",
    start_url: "/app",
    display: "standalone",
    dir: "rtl",
    lang: "he",
    background_color: "#fbf8f2",
    theme_color: "#8a5a12",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
