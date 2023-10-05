import Block from "@/components/common/Block";
import Hero from "@/components/common/Hero";
import ListHighlight from "@/components/common/ListHighlights";
import PageTitle from "@/components/common/PageTitle";
import SectionTitle from "@/components/common/SectionTitle";
import RessourceCard from "@/components/ressources/RessourceCard";
import { cmsHost, cmsInstance, shorten } from "@/helpers/cms";
import { Section } from "@/interfaces/cms/collectionsInterface";
import { fr } from "@codegouvfr/react-dsfr";
import MDContent from "@/components/common/MDContent";


export async function generateStaticParams() {
  const { data } = await cmsInstance.items('Pages').readByQuery({
    fields:'slug',
    filter:{
      status: {
        '_eq': 'published',
      },
      tag:{
        slug:{
          '_in':['plateformes','covoitureurs','employeurs']
        }
      }
    }
  });
  return data ? data.map((post:any) => ({
    slug: post.slug,
  })) : []
}

export default async function ProfilSinglePage({ params }: { params: { slug: string }}) {
  const { data } = await cmsInstance.items('Pages').readByQuery({
    filter: {
      slug: { _eq: params.slug },
    },
    fields: ['*', 'sections.*', 'sections.item.*','sections.item.highlights.Highlight_id.*','sections.item.categories.Categories_id.*'],
    limit: 1,
  });
  const hero = data ? data[0].sections.find((s:Section) => s.collection === 'Hero') : null
  const blocks = data ? data[0].sections.filter((s:Section) => s.collection === 'Block') : null
  const lists = data ? data[0].sections.filter((s:Section) => s.collection === 'List') : null
  const ressources = data ? data[0].sections.filter((s:Section) => s.collection === 'Ressources') : null

  return(
    <article id='content'>
      {!hero && 
        <PageTitle title={data ? data[0].title : ''} />
      }
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
      {data && data[0].content && 
        <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
          <div className={fr.cx('fr-col')}>
            <div className={fr.cx('fr-text--lg')}>
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
      {ressources.length >=1 && 
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
        </>
      }
      {data && data[0].complement &&
        <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
          <SectionTitle title='Ressources complémentaires' />
          <div className={fr.cx('fr-grid-row')}>
            <div className={fr.cx('fr-col')}>
              <div className={fr.cx('fr-text--lg')}>
                <MDContent source={data ? data[0].complement : ''} />
              </div>
            </div>
          </div>
        </div>
      }
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