import { type Metadata } from "next";
import Administration from "./AdministrationRedirect";

export const metadata: Metadata = { title: "Administration" };

export default function Page() {
  return <Administration />;
}
