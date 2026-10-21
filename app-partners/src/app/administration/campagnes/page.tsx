import { type Metadata } from "next";
import CampagnesDeclareesPage from "./CampagnesDeclareesPage";

export const metadata: Metadata = { title: "Campagnes déclarées" };

export default function Page() {
  return <CampagnesDeclareesPage />;
}
