
import { fr } from "@codegouvfr/react-dsfr";
import { cmsInstance } from "@/helpers/cms";
import { Metadata } from 'next';
import PageTitle from '@/components/common/PageTitle';

export const metadata: Metadata = {
  title: 'Plan du site | Observatoire.covoiturage.gouv.fr',
  description: 'Plan du site Observatoire.covoiturage.gouv.fr',
}

export default async function Plan() {
  const pages = await cmsInstance.items('Pages').readByQuery({
    status: {
      '_eq': 'published',
    },
    fields: ['title','slug','tag.slug'],
    limit: -1,
    sort:['date_created'] as never[],
  });
  const home = pages.data ? pages.data.find(p => p.tag.slug === 'accueil') : ''
  const obs = pages.data ? pages.data.filter(p => p.tag.slug === 'observatoire') : ''
  const collectivites = pages.data ? pages.data.filter(p => p.tag.slug === 'collectivites') : ''
  const autresActeurs = pages.data ? pages.data.filter(p => ['plateformes','covoitureurs','employeurs'].includes(p.tag.slug)) : ''
  const communs = pages.data ? pages.data.filter(p => p.tag.slug === 'commun') : ''
  const actus = await cmsInstance.items('Articles').readByQuery({
    status: {
      '_eq': 'published',
    },
    fields: ['title','slug'],
    limit: -1,
    sort:['date_created'] as never[],
  });
  const ressources = await cmsInstance.items('Ressources').readByQuery({
    status: {
      '_eq': 'published',
    },
    fields: ['title','slug'],
    limit: -1,
    sort:['date_created'] as never[],
  });

  return (
    <article id='content'>
      <PageTitle title='Plan du site' />
      <div className={fr.cx('fr-grid-row')}>
        <div className={fr.cx('fr-col')}>
          {home && 
            <ul>
              <li>
                <a className={fr.cx('fr-link')}  href="/" target="_self">{home.title}</a>
              </li>
            </ul>
          }
          {obs &&
            <>
              <h2 className={fr.cx('fr-h3','fr-mb-0')}>Observatoire</h2> 
              <ul>
                {obs.map((p, i)=>
                  <li key={i}> 
                    <a className={fr.cx('fr-link')}href={`/observatoire/${p.slug}`} target="_self">
                      {p.title}
                    </a>
                  </li>
                )}
                <li>
                  <a className={fr.cx('fr-link')}href={`/observatoire/territoire`} target="_self">
                    Observer un territoire
                  </a>
                </li>
              </ul>
            </>
          }
          {collectivites &&
            <>
              <h2 className={fr.cx('fr-h3','fr-mb-0')}>Collectivités</h2> 
              <ul>
                {collectivites.map((p, i)=>
                  <li key={i}> 
                    <a className={fr.cx('fr-link')}href={`/collectivites/${p.slug}`} target="_self">
                      {p.title}
                    </a>
                  </li>
                )}
              </ul>
            </>
          }
          {autresActeurs &&
            <>
              <h2 className={fr.cx('fr-h3','fr-mb-0')}>Autres acteurs</h2> 
              <ul>
                {autresActeurs.map((p, i)=>
                  <li key={i}> 
                    <a className={fr.cx('fr-link')}href={`/autres-acteurs/${p.slug}`} target="_self">
                      {p.title}
                    </a>
                  </li>
                )}
              </ul>
            </>
          }
          {actus.data &&
            <>
              <h2 className={fr.cx('fr-h3','fr-mb-0')}>
                <a href={`/actualites`} target="_self">
                  Actualités
                </a>
              </h2> 
              <ul>
                {actus.data.map((p, i)=>
                  <li key={i}> 
                    <a className={fr.cx('fr-link')}href={`/actualites/${p.slug}`} target="_self">
                      {p.title}
                    </a>
                  </li>
                )}
              </ul>
            </>
          }
          {ressources.data &&
            <>
              <h2 className={fr.cx('fr-h3','fr-mb-0')}>
                <a href={`/ressources`} target="_self">
                  Ressources
                </a>
              </h2> 
              <ul>
                {ressources.data.map((p, i)=>
                  <li key={i}> 
                    <a className={fr.cx('fr-link')}href={`/ressources/${p.slug}`} target="_self">
                      {p.title}
                    </a>
                  </li>
                )}
              </ul>
            </>
          }
           {communs &&
            <>
              <h2 className={fr.cx('fr-h3','fr-mb-0')}>Autres pages</h2> 
              <ul>
                {communs.map((p, i)=>
                  <li key={i}> 
                    <a className={fr.cx('fr-link')}href={`/${p.slug}`} target="_self">
                      {p.title}
                    </a>
                  </li>
                )}
              </ul>
            </>
          }
        </div>
      </div>
      <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
        <div className={fr.cx('fr-col')}>
          <a className={fr.cx('fr-link', 'fr-icon-arrow-up-fill', 'fr-link--icon-left')} href="#top">
            Haut de page
          </a>
        </div>
      </div>
    </article>
  );
}
