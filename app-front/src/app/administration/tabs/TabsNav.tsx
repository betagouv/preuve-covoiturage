'use client'
import { useAuth } from '@/providers/AuthProvider';
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import TabOperators from './TabOperators';
import TabProfil from './TabProfil';
import TabTerritories from './TabTerritories';
import TabUsers from './TabUsers';


export default function TabsNav() {
  const { user } = useAuth();
  const getTabs = () => {
    const tabs =  [
      {
        content: <TabProfil />,
        label: 'Mon profil'
      },
      {
        content: <TabUsers />,
        label: `Utilisateurs et accès`
      }
    ];
    if(["registry","operator"].includes(user?.role ?user.role : '')){ 
      tabs.push(
        {
        content: <TabOperators />,
        label: 'Opérateurs'
        }
      )
    }
    if(["registry","territory"].includes(user?.role ?user.role : '')){ 
      tabs.push(
        {
        content: <TabTerritories />,
        label: 'Territoires'
        }
      )
    }
    return tabs;
  }

  return (
    <Tabs
      tabs={getTabs()}
    />
  );
}