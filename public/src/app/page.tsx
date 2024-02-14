import Hero from "@/components/common/Hero";
import Block from "@/components/common/Block";
import SectionTitle from "@/components/common/SectionTitle";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { fr } from "@codegouvfr/react-dsfr";
import { fetchAPI, shorten } from "@/helpers/cms";
import RessourceCard from "@/components/ressources/RessourceCard";
import MDContent from "@/components/common/MDContent";
import { Metadata } from 'next';
import Highlight from '@/components/common/Highlight';

export const metadata: Metadata = {
  title: 'Accueil | Observatoire.covoiturage.gouv.fr',
  description: 'Développer le covoiturage de courte distance',
}

export default async function Home() {
  const query = {
    filters: {
      slug: {
        $eq: 'accueil',
      },
    },
    populate: {
      hero: {
        populate: 'buttons,img'
      },
      block: {
        populate: 'buttons,img'
      },
      list: {
        populate: '*'
      }
    },  
  };
  const response  = await fetchAPI('/pages',query);
  const data = response.data[0]
  const hero = data.attributes.hero
  const block = data.attributes.block
  const list = data.attributes.list

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
      { hero && <Hero 
          title={hero.title} 
          subtitle={hero.subtitle}
          content={hero.content} 
          img={hero.img.data ? hero.img.data.attributes.formats.medium.url : undefined} 
          alt={hero.alt} 
          buttons={hero.buttons} 
        />
      }
      {data.content && 
        <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
          <div className={fr.cx('fr-col')}>
            <div>
              <MDContent source={data.content} />
            </div>
          </div>
        </div>
      }
      {block &&
        <Block 
          title={block.title} 
          content={block.content} 
          img={block.img.data.attributes.url} 
          alt={block.alt} 
          buttons={block.buttons} 
        />
      }
      {list && 
        <div className={fr.cx('fr-grid-row')}>
          {list.map((l:any, i:number) => 
            l.__component === 'page.highlight' 
            ? <Highlight key={i} 
                title={l.title}
                content={l.content}
                img={l.img.data.attributes.url}
                buttons={l.buttons}
                classes={l.classes} 
              /> 
            : <SectionTitle key={i} title={l.title} />        
          )}
        </div>
      }
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
      {/*data.attributes.resource.data && 
        <>
          <SectionTitle title='Ressources' />
          <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
            {data.attributes.resource.data.map((r:any, i:number) =>  
              <div key={i} className={fr.cx('fr-col', 'fr-col-md-4')}>
                <RessourceCard 
                  title={r.title}
                  content={shorten(r.content, 100)}
                  date={new Date(r.date_created).toLocaleDateString('fr-FR')}
                  link={r.link}
                  file={r.file ? `${cmsHost}/assets/${r.file}` : undefined}
                  img={`${cmsHost}/assets/${r.img}`}
                  img_legend={r.img_legend}                
                />
              </div>
            )}
          </div>
        </>
            */}
    </div>
  );
}
