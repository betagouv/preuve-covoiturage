import { type Metadata } from "next";
import Activite from "./ActiviteRedirect";

export const metadata: Metadata = { title: "Activité" };

export default function Page() {
  return <Activite />;
}
