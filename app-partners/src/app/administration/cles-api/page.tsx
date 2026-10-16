import { type Metadata } from "next";
import TabOperatorCredentials from "./ClesApiPage";

export const metadata: Metadata = { title: "Clés d'API" };

export default function Page() {
  return <TabOperatorCredentials />;
}
