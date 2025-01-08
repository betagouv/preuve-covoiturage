'use client'
import { Config } from '@/config';
import { addParamsToUrl, generateNonce } from '@/helpers/auth';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@codegouvfr/react-dsfr/Button';

import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { state, setState, setNonce, isAuth, setIsAuth } = useAuth();
  const router = useRouter();

  const generateToken = () => {
    const stateToken = generateNonce();
    setState(stateToken);
    sessionStorage.setItem('stateToken', stateToken);
    const nonceToken = generateNonce();
    setNonce(nonceToken);
    sessionStorage.setItem('nonceToken', nonceToken);
    return ({stateToken, nonceToken})
  }
  const authClick = () => {
    const {stateToken, nonceToken} = generateToken();
    const baseUrl:string = `${Config.get('auth.domain')}/api/v2/authorize`;
    const params = {
      response_type: 'code',
      client_id: Config.get('auth.client_id'),
      redirect_uri: Config.get('auth.redirect_uri'),
      scope: Config.get('auth.scopes'),
      state: stateToken,
      nonce: nonceToken,
    };
    router.push(addParamsToUrl(baseUrl, params));
  };

  const disconnectClick = () => {
    const baseUrl:string = `${Config.get('auth.domain')}/api/v2/session/end`;
    const params = {
      id_token_hint: sessionStorage.getItem('idToken'),
      state: state,
      post_logout_redirect_uri: Config.get('auth.redirect_uri'),
    };
    router.push(addParamsToUrl(baseUrl, params));
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