"use client";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useState } from "react";
import TabBref from "./TabBref";
import TabCampaigns from "./TabCampaigns";
import TabExport from "./TabExport";

export default function TabsNav() {
  const [activeTab, setActiveTab] = useState("1");
  const tabs = [
    {
      tabId: "1",
      label: "Activité en bref",
    },
    {
      tabId: "2",
      label: `Suivi des campagnes`,
    },
    {
      tabId: "3",
      label: "Export des données",
    },
  ];
  const tabContent = () => {
    switch (activeTab) {
      case "1":
        return <TabBref />;
      case "2":
        return <TabCampaigns />;
      case "3":
        return <TabExport />;
    }
  };

  return (
    <Tabs tabs={tabs} selectedTabId={activeTab} onTabChange={setActiveTab}>
      {tabContent()}
    </Tabs>
  );
}
