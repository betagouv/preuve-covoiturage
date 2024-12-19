'use client'
import { useAuth } from '@/providers/AuthProvider';
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import TabProfil from './TabProfil';
import TabUsers from './TabUsers';


export default function TabsNav() {
  const { user } = useAuth();
  const roles = ["admin","operator"]
  const getTabs = (roles: string[]) => {
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
    if(roles.includes(user?.role ? user.role : 'territory')){ 
      tabs.push(
        {
        content: <p>Content of tab3</p>,
        label: 'Opérateurs'
        }
      )
    }
    return tabs;
  }

  return (
    <Tabs
      tabs={getTabs(roles)}
    />
  );
}