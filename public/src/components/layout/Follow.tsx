import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Button from '@codegouvfr/react-dsfr/Button';
import Link from 'next/link';

export function Follow() {
  return (
    <div className={fr.cx('fr-follow','fr-footer','fr-mt-10v')}>
      <div className={fr.cx('fr-container')}>
        <div className={fr.cx('fr-grid-row')}>
          <div className={fr.cx('fr-col-12','fr-col-md-8')}>
            <div className={fr.cx('fr-follow__newsletter')}>
              <div>
                <p className={fr.cx('fr-h5','fr-follow__title')}>
                  Une question ? Écrivez-nous !
                </p>
                <p>
                  Nous vous répondrons au plus vite ou vous redirigerons vers le bon service
                </p>
                <ButtonsGroup
                  buttons={[
                    {
                      children: 'Poser une question',
                      iconId: 'fr-icon-mail-line',
                      linkProps: {
                        href: 'https://covoiturage.beta.gouv.fr/nous-contacter/'
                      }
                    },
                  ]}
                  buttonsEquisized
                />
              </div>
            </div>
          </div>
          <div className={fr.cx('fr-col-12','fr-col-md-4')}>
            <div className={fr.cx('fr-follow__social')}>
              <p className={fr.cx('fr-h5','fr-follow__title')}>
                Suivez-nous sur les réseaux sociaux
              </p>
              <div>
                <Link href='https://twitter.com/Covoitbetagouv' style={{"backgroundImage": "none","display":"inline-block"}}>
                  <Button 
                    iconId='fr-icon-twitter-fill'
                    title="Label button"
                  /> 
                </Link>
                <Link href='https://www.linkedin.com/company/registre-de-preuve-de-covoiturage' style={{"backgroundImage": "none","display":"inline-block"}}>
                  <Button 
                    iconId='fr-icon-linkedin-box-fill'
                    title="LinkedIn"
                  /> 
                </Link>
                <Link href='https://www.youtube.com/channel/UC-Dge-XxJCIRG22jcGM-VtA' style={{"backgroundImage": "none","display":"inline-block"}}>
                  <Button 
                    iconId='fr-icon-youtube-fill'
                    title="You Tube"
                  /> 
                </Link>
                <Link href='https://github.com/betagouv/preuve-covoiturage' style={{"backgroundImage": "none","display":"inline-block"}}>
                  <Button 
                    iconId='fr-icon-github-fill'
                    title="GitHub"
                  /> 
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}