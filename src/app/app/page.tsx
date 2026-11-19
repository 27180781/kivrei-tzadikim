import type { Metadata } from "next";
import NavApp from "@/components/NavApp";

export const metadata: Metadata = { title: "ניווט לקברי צדיקים" };

export default function AppPage() {
  return <NavApp />;
}
