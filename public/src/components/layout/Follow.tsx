import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';

export function Follow() {
  return (
    <div className={fr.cx('fr-follow')}>
      <div className={fr.cx('fr-container')}>
        <div className={fr.cx('fr-grid-row')}>
          <div className={fr.cx('fr-col-12','fr-col-md-8')}>
            <div className={fr.cx('fr-follow__newsletter')}>
              <div>
                <p className={fr.cx('fr-h5','fr-follow__title')}>
                  Une question ? Écrivez-nous !
                </p>
                <p>
                  Vous avez une question sur le covoiturage ? Ecrivez directement à l&apos;équipe de covoiturage.beta
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
              <ButtonsGroup
                  buttons={[
                    {
                      children: 'test',
                      iconId: 'fr-icon-twitter-fill',
                      linkProps: {
                        href: 'https://twitter.com/Covoitbetagouv'
                      }
                    },
                    {
                      children: 'test',
                      iconId: 'fr-icon-linkedin-box-fill',
                      linkProps: {
                        href: 'https://www.linkedin.com/company/registre-de-preuve-de-covoiturage'
                      }
                    },
                    {
                      children: 'test',
                      iconId: 'fr-icon-youtube-fill',
                      linkProps: {
                        href: 'https://www.youtube.com/channel/UC-Dge-XxJCIRG22jcGM-VtA'
                      }
                    },
                    {
                      children: 'test',
                      iconId: 'fr-icon-github-fill',
                      linkProps: {
                        href: 'https://github.com/betagouv/preuve-covoiturage'
                      }
                    },
                  ]}
                  buttonsEquisized
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}