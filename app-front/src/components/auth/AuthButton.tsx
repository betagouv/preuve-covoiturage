'use client'
import { Config } from '@/config';
import { useAuth } from '@/providers/AuthProvider';
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";

export function AuthButton() {
  const { state, nonce } = useAuth();
  const baseUrl:string = Config.get('auth.domain');
  const params = {
    response_type: 'code',
    client_id: Config.get('auth.client_id'),
    state: state,
    nonce: nonce,
    redirect_uri:encodeURIComponent(Config.get('auth.redirect_uri')),
    scopes: Config.get('auth.scopes')
  }
  const convertParamsToQueryString = (baseUrl:string, params:object) => {
    const queryString = new URLSearchParams();
  
    // Ajouter chaque paramètre encodé
    Object.entries(params).forEach(([key, value]) => {
      queryString.append(key, value);
    });
  
    return `${baseUrl}?${queryString.toString()}`;
  };

  return ( 
    <>
    {Config.get('auth.domain')}
    <ProConnectButton url={convertParamsToQueryString(baseUrl, params)} /> 
    </>  
  );
};