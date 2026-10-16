import { type Metadata } from "next";
import TabCampaigns from "./CampagnesPage";

export const metadata: Metadata = { title: "Suivi des campagnes" };

export default function Page() {
  return <TabCampaigns />;
}
