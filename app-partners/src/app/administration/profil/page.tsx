import { type Metadata } from "next";
import ProfilPage from "./ProfilPage";

export const metadata: Metadata = { title: "Mon profil" };

export default function Page() {
  return <ProfilPage />;
}
