import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';

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
                        href: 'https://covoiturage.beta.gouv.fr/nous-contacter/',
                        title: "Nous contacter - nouvelle fenêtre",
                        "aria-label": "Nous contacter - nouvelle fenêtre",
                        target: '_blank'
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
              <ul className={fr.cx('fr-btns-group')}>
                <li>
                  <a className={fr.cx('fr-btn--twitter','fr-btn')} 
                    target="_blank" 
                    href="https://twitter.com/Covoitbetagouv"
                    title="Twitter - nouvelle fenêtre"
                    aria-label="Twitter - nouvelle fenêtre"
                    
                  />
                </li>
                <li>
                  <a className={fr.cx('fr-btn--linkedin','fr-btn')} 
                    target="_blank" 
                    href="https://www.linkedin.com/company/registre-de-preuve-de-covoiturage"
                    title="LinkedIn - nouvelle fenêtre"
                    aria-label="LinkedIn - nouvelle fenêtre"
                  />
                </li>
                <li>
                  <a className={fr.cx('fr-btn--youtube','fr-btn')} 
                    target="_blank" 
                    href="https://www.youtube.com/channel/UC-Dge-XxJCIRG22jcGM-VtA"
                    title="YouTube - nouvelle fenêtre"
                    aria-label="YouTube - nouvelle fenêtre"
                  />
                </li>
                <li>
                  <a className={fr.cx('fr-btn--github','fr-btn')} 
                    target="_blank" 
                    href="https://github.com/betagouv/preuve-covoiturage"
                    title="GitHub - nouvelle fenêtre"
                    aria-label="GitHub - nouvelle fenêtre"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}