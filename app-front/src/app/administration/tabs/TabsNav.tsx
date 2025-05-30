"use client";
import { useAuth } from "@/providers/AuthProvider";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import TabOperators from "./TabOperators";
import TabProfil from "./TabProfil";
import TabTerritories from "./TabTerritories";
import TabUsers from "./TabUsers";
import TabOperatorTokens from "./TabOperatorTokens";

export default function TabsNav() {
  const { user, simulatedRole } = useAuth();
  const getTabs = () => {
    const tabs = [
      {
        content: <TabProfil />,
        label: "Mon profil",
      },
    ];
    if (
      ["registry.admin", "operator.admin", "territory.admin"].includes(
        user?.role ?? "",
      )
    ) {
      tabs.push({
        content: <TabUsers />,
        label: `Utilisateurs et accès`,
      });
    }
    if (user?.role === "registry.admin" && !simulatedRole) {
      tabs.push({
        content: <TabOperators />,
        label: "Opérateurs",
      });
    }
    if (user?.role === "registry.admin" && !simulatedRole) {
      tabs.push({
        content: <TabTerritories />,
        label: "Territoires",
      });
    }
    if (user?.operator_id) {
      tabs.push({
        content: <TabOperatorTokens />,
        label: `Tokens d'API`,
      });
    }
    return tabs;
  };

  return <Tabs tabs={getTabs()} />;
}
