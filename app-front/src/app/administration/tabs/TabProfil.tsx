import { Config } from '@/config';
import { useAuth } from '@/providers/AuthProvider';
import { fr } from '@codegouvfr/react-dsfr';

export default function TabProfil() {
  const { user } = useAuth();
  return(
    <>
     { user &&
      <>
        <h3 className={fr.cx('fr-callout__title')}>Mon profil</h3>
        <p><b>Nom:</b> {user.name}</p>
        <p><b>Rôle:</b> {user.role}</p>
        {user.territory_id && <p><b>Territoire:</b> {user.territory_id}</p>}
        <a href={`${Config.get('auth.pc_uri')}/personal-information`} target='_blank'>Modifier mes informations sur ProConnect</a>
      </>
     }
    </>    
  );
}