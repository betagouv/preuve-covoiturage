"use client";
import { useAuth } from "@/providers/AuthProvider";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useState } from "react";
import TabOperators from "./TabOperators";
import TabOperatorTokens from "./TabOperatorTokens";
import TabProfil from "./TabProfil";
import TabTerritories from "./TabTerritories";
import TabUsers from "./TabUsers";

export default function TabsNav() {
  const { user, simulatedRole } = useAuth();
  const [activeTab, setActiveTab] = useState("1");
  const getTabs = () => {
    const tabs = [
      {
        tabId: "1",
        label: "Mon profil",
      },
    ];
    if (
      ["registry.admin", "operator.admin", "territory.admin"].includes(
        user?.role ?? "",
      )
    ) {
      tabs.push({
        tabId: "2",
        label: `Utilisateurs et accès`,
      });
    }
    if (user?.role === "registry.admin" && !simulatedRole) {
      tabs.push({
        tabId: "3",
        label: "Opérateurs",
      });
    }
    if (user?.role === "registry.admin" && !simulatedRole) {
      tabs.push({
        tabId: "4",
        label: "Territoires",
      });
    }
    if (user?.operator_id) {
      tabs.push({
        tabId: "5",
        label: `Tokens d'API`,
      });
    }
    return tabs;
  };
  const tabContent = () => {
    switch (activeTab) {
      case "1":
        return <TabProfil />;
      case "2":
        return <TabUsers />;
      case "3":
        return <TabOperators />;
      case "4":
        return <TabTerritories />;
      case "5":
        return <TabOperatorTokens />;
    }
  };

  return (
    <Tabs tabs={getTabs()} selectedTabId={activeTab} onTabChange={setActiveTab}>
      {tabContent()}
    </Tabs>
  );
}
