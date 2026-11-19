"use client";

import { useEffect } from "react";

/** משבצת מודעה של Magnet Ads. */
const SLOT_ID = "0dbe73f0-078d-4f6b-a6dc-2514d8c7be25";
const SRC = "https://app.magnetads.co.il/widget.js";

export default function AdSlot({ className = "" }: { className?: string }) {
  useEffect(() => {
    // טוענים את הסקריפט מחדש בכל הצגה, כדי שימלא גם משבצות שנוספו במעבר בין דפים
    document.querySelectorAll(`script[data-magnet-ads]`).forEach((s) => s.remove());
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.dataset.magnetAds = "1";
    document.body.appendChild(s);
  }, []);

  return (
    <div className={`flex justify-center ${className}`}>
      {/* Magnet Ads ad slot */}
      <div data-ad-slot={SLOT_ID} />
    </div>
  );
}
