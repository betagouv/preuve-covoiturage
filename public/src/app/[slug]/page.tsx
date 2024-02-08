import Block from "@/components/common/Block";
import Hero from "@/components/common/Hero";
import PageTitle from "@/components/common/PageTitle";
import SectionTitle from "@/components/common/SectionTitle";
import RessourceCard from "@/components/ressources/RessourceCard";
import { fetchAPI, shorten } from "@/helpers/cms";
import { fr } from "@codegouvfr/react-dsfr";
import MDContent from "@/components/common/MDContent";
import Highlight from '../../components/common/Highlight';

export async function generateMetadata({ params }: { params: { slug: string }}) {
  const query = {
    filters: {
      slug: {
        $eq: params.slug,
      },
      tags:{
        slug:{
          $eq: 'commun',
        }
      }
    },
    fields:['title','content']
  };
  const response  = await fetchAPI('/pages',query);
  const data = response.data[0]
  return {
    title: `${data ? data.attributes.title : ''} | Observatoire.covoiturage.gouv.fr`,
    description: shorten(`${data && data.attributes.content ? data.attributes.content :
    'Développer le covoiturage courte distance'}`,150),
  }
}

export async function generateStaticParams() {
  const query = {
    filters: {
      tags:{
        slug:{
          $eq: 'commun',
        }
      }
    },
    fields:['slug']
  };
  const response  = await fetchAPI('/pages',query);
  const data = response.data
  return data ? data.map((p:any) => ({
    slug: p.attributes.slug,
  })) : []
}

export default async function CommunSinglePage({ params }: { params: { slug: string }}) {
  const query = {
    filters: {
      slug: {
        $eq: params.slug,
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
        populate: 'buttons,img'
      }
    },  
  };
  const response  = await fetchAPI('/pages',query);
  const data = response.data[0];
  const hero = data.attributes.hero;
  const block = data.attributes.block;
  const list = data.attributes.list;
    
  return(
    <div id='content'>
      {!hero && 
        <PageTitle title={data ? data.attributes.title : ''} />
      }
      {hero && 
        <Hero 
          title={hero.title} 
          subtitle={hero.subtitle}
          content={hero.content} 
          img={hero.img} 
          alt={hero.alt} 
          buttons={hero.buttons} 
        />
      }
      {data && data.attributes.content && 
        <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
          <div className={fr.cx('fr-col')}>
            <div className={fr.cx('fr-text--lg')}>
              <MDContent source={data.attributes.content} />
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
      {/*ressources.length >=1 && 
        <>
          <SectionTitle title='Ressources' />
          <div className={fr.cx('fr-grid-row','fr-grid-row--gutters')}>
            {ressources && ressources.map((r:any, i:number) =>  
              <div key={i} className={fr.cx('fr-col', 'fr-col-md-4')}>
                <RessourceCard 
                  title={r.item.title}
                  content={shorten(r.item.content, 100)}
                  date={new Date(r.item.date_created).toLocaleDateString('fr-FR')}
                  link={r.item.link}
                  file={r.item.file ? `${cmsHost}/assets/${r.item.file}` : undefined}
                  img={`${cmsHost}/assets/${r.item.img}`}
                  img_legend={r.item.img_legend}                
                />
              </div>
            )}
          </div>
        </>*/
      }
      {/*data && data[0].complement &&
        <div className={fr.cx('fr-grid-row','fr-mt-5w')}>
          <SectionTitle title='Ressources complémentaires' />
          <div className={fr.cx('fr-grid-row')}>
            <div className={fr.cx('fr-col')}>
              <div className={fr.cx('fr-text--lg')}>
                <MDContent source={data ? data[0].complement : ''} />
              </div>
            </div>
          </div>
        </div>*/
      }
    </div>
  );
}