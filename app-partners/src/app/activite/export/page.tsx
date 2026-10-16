import { type Metadata } from "next";
import TabExport from "./ExportPage";

export const metadata: Metadata = { title: "Export des données" };

export default function Page() {
  return <TabExport />;
}
