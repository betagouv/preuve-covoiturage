import Hero from "@/components/common/Hero";
import Block from "@/components/common/Block";
import ListHighlight from "@/components/common/ListHighlights";
import SectionTitle from "@/components/common/SectionTitle";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { fr } from "@codegouvfr/react-dsfr";
import { cmsHost, cmsInstance, shorten } from "@/helpers/cms";
import RessourceCard from "@/components/ressources/RessourceCard";
import { Section } from "@/interfaces/cms/collectionsInterface";
import MDContent from "@/components/common/MDContent";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil | Observatoire.covoiturage.gouv.fr',
  description: 'Développer le covoiturage de courte distance',
}

export default async function Home() {
  const { data } = await cmsInstance.items('Pages').readByQuery({
    filter: {
      slug: { _eq: 'accueil' },
    },
    fields: ['*', 'sections.*', 'sections.item.*','sections.item.highlights.Highlight_id.*','sections.item.categories.Categories_id.*'],
    limit: 1,
  });

  const hero = data ? data[0].sections.find((s:Section) => s.collection === 'Hero') : null
  const blocks = data ? data[0].sections.filter((s:Section) => s.collection === 'Block') : null
  const lists = data ? data[0].sections.filter((s:Section) => s.collection === 'List') : null
  const ressources = data ? data[0].sections.filter((s:Section) => s.collection === 'Ressources') : null
  const tiles = [{
    desc:'Forfait mobilités durables, animations covoiturage en entreprise, mise en relation entre salariés, charte employeur engagé dans le covoiturage',
    grey: true,
    imageUrl: "https://cms.covoiturage.beta.gouv.fr/assets/6d16d7c5-82fe-4526-a32f-e13bd161bd8f",
    linkProps:{
      href: '/autres-acteurs/entreprises',
      title:"Vous êtes une entreprise"
    },
    title:"Une entreprise"
  },{
    desc:"Un bonus de 100€ pour les conducteurs réalisant leurs premiers trajets en covoiturage, un forfait mobilités durable jusqu'à 800€ par ans versé par votre employeur, quelques euros versés par votre collectivité à chaque trajet.",
    grey: true,
    imageUrl: "https://cms.covoiturage.beta.gouv.fr/assets/03438e15-8661-4ff4-9090-d3936527c869",
    linkProps:{
      href: '/autres-acteurs/particuliers',
      title:"Vous êtes un particulier"
    },
    title:"Un particulier"
  },{
    desc:"Découvrir le registre de preuve de covoiturage et en devenir partenaire",
    grey: true,
    imageUrl: "https://cms.covoiturage.beta.gouv.fr/assets/ac8000a8-09b8-4e37-868e-bc877c231f71",
    linkProps:{
      href: '/autres-acteurs/operateurs',
      title:"Vous êtes une plateforme de covoiturage"
    },
    title:"Une plateforme de covoiturage"
  }
]

  return (
    <div id='content'>
      {hero && 
        <Hero 
          title={hero.item.title} 
          subtitle={hero.item.subtitle}
          content={hero.item.content} 
          img={hero.item.img} 
          alt={hero.item.alt} 
          buttons={hero.item.buttons} 
        />
      }
      {data && data[0].content && 
        <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
          <div className={fr.cx('fr-col')}>
            <div>
              <MDContent source={data[0].content} />
            </div>
          </div>
        </div>
      }
      {blocks && blocks.map((b:any, i:number) =>
        <Block 
          key={i}
          title={b.item.title} 
          content={b.item.content} 
          img={b.item.img} 
          alt={b.item.alt} 
          buttons={b.item.buttons} 
        />
      )}
      {lists && lists.map((l:any, i:number) =>
        <div key={i} className={fr.cx('fr-grid-row')}>
          <SectionTitle title={l.item.title} />
          <ListHighlight highlights={l.item.highlights.map((h:any) => h.Highlight_id)} />
        </div>
      )}
      <SectionTitle title='Vous êtes ?' />
      <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
        {tiles && tiles.map( (t, i) => 
          <div key={i} className={fr.cx('fr-col-12','fr-col-md-4')}>
            <Tile 
              title={t.title}
              desc={t.desc}
              grey={t.grey}
              imageUrl={t.imageUrl}
              imageAlt={''}
              linkProps={t.linkProps}
            />
          </div>
        )}
      </div>
      {ressources && 
      <>
        <SectionTitle title='Ressources' />
        <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
          {ressources.map((r:any, i:number) =>  
            <div key={i} className={fr.cx('fr-col', 'fr-col-md-4')}>
              <RessourceCard 
                title={r.item.title}
                content={shorten(r.item.content, 100)}
                date={new Date(r.item.date_created).toLocaleDateString('fr-FR')}
                link={r.item.link}
                file={`${cmsHost}/assets/${r.item.file}`}
                img={`${cmsHost}/assets/${r.item.img}`}
                img_legend={r.item.img_legend}                
              />
            </div>
          )}
        </div>
      </>}
      {data && data[0].complement &&
        <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
          <SectionTitle title='Ressources complémentaires' />
          <div className={fr.cx('fr-grid-row')}>
            <div className={fr.cx('fr-col')}>
              <div>
                <MDContent source={data ? data[0].complement : ''} />
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
