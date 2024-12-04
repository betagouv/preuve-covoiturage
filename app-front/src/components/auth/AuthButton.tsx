'use client'
import { Config } from '@/config';
import { addParamsToUrl, generateNonce } from '@/helpers/auth';
import { useAuth } from '@/providers/AuthProvider';
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { setState, setNonce } = useAuth();
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
  const handleClick = () => {
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

  return ( 
    <ProConnectButton onClick={() => handleClick()} /> 
  );
};