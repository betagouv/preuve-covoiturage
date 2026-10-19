import { type Metadata } from "next";
import TabTerritories from "./TerritoiresPage";

export const metadata: Metadata = { title: "Territoires" };

export default function Page() {
  return <TabTerritories />;
}
