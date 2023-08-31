import Hero from "@/components/common/Hero";
import Block from "@/components/common/Block";
import ListHighlight from "@/components/common/ListHighlights";
import SectionTitle from "@/components/common/SectionTitle";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { fr } from "@codegouvfr/react-dsfr";
import { cmsHost, cmsInstance, shorten } from "@/helpers/cms";
import RessourceCard from "@/components/ressources/RessourceCard";
import { Section } from "@/interfaces/cms/collectionsInterface";

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
    desc:'Découvrez les bienfaits du covoiturage, mettez en place le Forfait Mobilité Durable et accompagnez vos salariés dans l\'usage du covoiturage',
    grey: true,
    imageUrl: "https://www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png",
    linkProps:{
      href: '#'
    },
    title:"Une entreprise"
  },{
    desc:"Comprendre le covoiturage au quotidien et réduire mon impact carbone au quotidien, suis-je éligible à une aide?",
    grey: true,
    imageUrl: "https://www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png",
    linkProps:{
      href: '#'
    },
    title:"Un particulier"
  },{
    desc:"Découvrir le registre de preuve de covoiturage et en devenir partenaire",
    grey: true,
    imageUrl: "https://www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png",
    linkProps:{
      href: '#'
    },
    title:"Un opérateur de covoiturage"
  }
]

  return (
    <article id='content'>
      {hero && 
        <Hero 
          title={hero.item.title} 
          subtitle={hero.item.subtitle}
          content={hero.item.content} 
          img={hero.item.img} 
          alt={hero.item.alt} 
          backgroundColor={hero.item.background_color} 
          buttons={hero.item.buttons} 
        />
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
      <SectionTitle title='Vous êtes ?' />
      <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
        {tiles && tiles.map( (t, i) => 
          <div key={i} className={fr.cx('fr-col-12','fr-col-md-4')}>
            <Tile 
              title={t.title}
              desc={t.desc}
              grey={t.grey}
              imageUrl={t.imageUrl}
              linkProps={t.linkProps}
            />
          </div>
        )}
      </div>
    </article>
  );
}
