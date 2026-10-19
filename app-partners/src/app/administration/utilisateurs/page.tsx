import { type Metadata } from "next";
import TabUsers from "./UtilisateursPage";

export const metadata: Metadata = { title: "Utilisateurs et accès" };

export default function Page() {
  return <TabUsers />;
}
