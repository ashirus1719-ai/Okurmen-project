import type { Metadata } from "next";
import DecoyLanding from "./decoy-landing";

export const metadata: Metadata = {
  title: "Окурмэн IT — курсы программирования",
  description: "Курсы программирования для всех.",
  robots: { index: false, follow: false },
};

export default function DraftPage() {
  return <DecoyLanding />;
}
