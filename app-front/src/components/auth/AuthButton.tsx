'use client'
import { Config } from '@/config';
import { useAuth } from '@/providers/AuthProvider';
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { state, nonce } = useAuth();
  const router = useRouter();
  const baseUrl:string = Config.get('auth.domain');
  const params = {
    response_type: 'code',
    client_id: Config.get('auth.client_id'),
    redirect_uri: Config.get('auth.redirect_uri'),
    //acr_values:'eidas1',
    scope: Config.get('auth.scopes'),
    state: state,
    nonce: nonce,
  }
  const convertParamsToQueryString = (baseUrl:string, params:object) => {
    const queryString = new URLSearchParams();
  
    // Ajouter chaque paramètre encodé
    Object.entries(params).forEach(([key, value]) => {
      queryString.append(key, value);
    });
  
    return `${baseUrl}/api/v2/authorize?${queryString.toString()}`;
  };

  return ( 
    <ProConnectButton onClick={() => {router.push(convertParamsToQueryString(baseUrl, params))}} /> 
  );
};