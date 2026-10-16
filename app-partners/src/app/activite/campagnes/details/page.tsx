import { type Metadata } from "next";
import { Suspense } from "react";
import CampaignDetails from "./CampaignDetailsPage";

export const metadata: Metadata = { title: "Détail de la campagne" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CampaignDetails />
    </Suspense>
  );
}
