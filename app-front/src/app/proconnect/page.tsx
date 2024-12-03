'use client'
import { fr } from '@codegouvfr/react-dsfr';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import PageTitle from '../../components/common/PageTitle';
import { useAuth } from '../../providers/AuthProvider';


export default function Proconnect() {
  const params = useSearchParams();
  const { state, getCode } =useAuth();
  useEffect(() => {
    getCode(params.get('state'), params.get('code'),params.get('iss'));
  }, [params, getCode]);
  
  return(
    <div className={fr.cx('fr-container')}>
      <div id='content'>
        <PageTitle title={`En cours de connexion...`} />
        {state}
      </div>
    </div>
  );
}