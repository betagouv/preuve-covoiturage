'use client'
import { useAuth } from '@/providers/AuthProvider';
import { HeaderQuickAccessItem } from "@codegouvfr/react-dsfr/Header";

export function AuthButton(props:{id?:string}) {
  const {isAuth, login, logout} = useAuth();
  const { id } = props;
  return (
    <HeaderQuickAccessItem
        id={`login-${id}`}
        quickAccessItem={{
            iconId: "fr-icon-lock-line",
            buttonProps: {
                onClick: isAuth ? logout : login 
            },
            text: isAuth ? 'Se déconnecter' : 'M’identifier'
        }}
    />
    
  );
};