import { type Metadata } from "next";
import TabOperators from "./OperateursPage";

export const metadata: Metadata = { title: "Opérateurs" };

export default function Page() {
  return <TabOperators />;
}
