'use client'
import { Config } from '@/config';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@codegouvfr/react-dsfr/Button';

import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { isAuth, setIsAuth } = useAuth();
  const router = useRouter();

  const authClick = () => {
    const url:string = `${Config.get('auth.domain')}/auth/login`;
    router.push(url);
  };

  const disconnectClick = () => {
    setIsAuth(false);
  };

  return (
    <>
      {!isAuth && 
        <ProConnectButton onClick={() => authClick()} />
      }
      {isAuth && 
        <Button
          linkProps={{
            href: '',
            onClick: disconnectClick
          }}
        >
        Déconnexion
        </Button>
      }
    </> 
  );
};