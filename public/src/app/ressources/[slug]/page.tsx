import PageTitle from "@/components/common/PageTitle";
import Share from "@/components/common/Share";
import { Config } from "@/config";
import { fr } from "@codegouvfr/react-dsfr";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Image from 'next/image';
import { fetchAPI, shorten } from "@/helpers/cms";
import MDContent from "@/components/common/MDContent";
import { Button } from "@codegouvfr/react-dsfr/Button";

export async function generateMetadata({ params }: { params: { slug: string }}) {
  const query = {
    filters: {
      slug: {
        $eq: params.slug,
      }
    },
    fields:['title','content']
  };
  const response  = await fetchAPI('/resources',query);
  const data = response.data[0]
  return {
    title: `${data ? data.attributes.title : ''} | Observatoire.covoiturage.gouv.fr`,
    description: shorten(`${data && data.attributes.content ? data.attributes.content : ''}`,150),
  }
}

export async function generateStaticParams() {
  const query = {
    fields:['slug']
  };
  const response  = await fetchAPI('/resources',query);
  const data = response.data
  return data ? data.map((p:any) => ({
    slug: p.attributes.slug,
  })) : []
}

export default async function ResourceSingle({ params }: { params: { slug: string }}) {
  const hostUrl = Config.get<string>('next.public_url', 'http://localhost:4200');
  const location = `${hostUrl}/ressources/${params.slug}`;
  const query = {
    filters: {
      slug: {
        $eq: params.slug,
      },
    },
    populate: '*',  
  };
  const response  = await fetchAPI('/resources',query);
  const data = response.data[0];

  const share = [
    {
      name:'Facebook', 
      icon:'fr-share__link--facebook', 
      href:`https://www.facebook.com/sharer.php?u=${location}`,
    },
    {
      name:'Twitter', 
      icon:'fr-share__link--twitter', 
      href:`https://twitter.com/intent/tweet?url=${location}`,
    },
    {
      name:'LinkedIn', 
      icon:'fr-share__link--linkedin', 
      href:`https://www.linkedin.com/shareArticle?url=${location}`,
    },
    {
      name:'Email', 
      icon:'fr-share__link--mail', 
      href:`mailto:?subject=${data ? data.attributes.title : ''}&body=${data ? data.attributes.description : ''} ${location}`,
    }
  ]

  return (
    <article id='resource-content'>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
      { data && 
        <div className={fr.cx('fr-col','fr-col-12')}>
          <PageTitle title={data.attributes.title} />
          { data.attributes.public_date &&
            <p>Publié le {new Date(data.attributes.public_date).toLocaleDateString('fr-FR')}</p>
          }
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col','fr-col-md-9')}>
              <ul className={fr.cx('fr-tags-group')}>
                {data.attributes.categories &&
                  data.attributes.categories.data.map((c:any, i:number) => {
                    return (
                      <li key={i}>
                        <Tag
                          linkProps={{
                            href: `/ressources/categorie/${c.attributes.slug}`
                          }}
                        >
                          {c.attributes.label}
                        </Tag>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
            <div className={fr.cx('fr-col','fr-col-md-3')}>
              <Share social={share} location={location} />
            </div>
          </div>          
          <figure style={{textAlign:'center'}}>
            <Image className={fr.cx('fr-responsive-img', 'fr-responsive-img--16x9')} 
              src={data.attributes.img.data.attributes.formats.large ? data.attributes.img.data.attributes.formats.large.url: data.attributes.img.data.attributes.url } 
              alt={''} 
              width={data.attributes.img.data.attributes.formats.large ? data.attributes.img.data.attributes.formats.large.width : data.attributes.img.data.attributes.width} 
              height={data.attributes.img.data.attributes.formats.large ? data.attributes.img.data.attributes.formats.large.height : data.attributes.img.data.attributes.height} 
            />
          </figure>
          <div>
            <MDContent source={data.attributes.content} />
          </div>
          {data.attributes.link &&
            <Button
              linkProps={data.attributes.link.startsWith('http') ? {
                  href: data.attributes.link,
                  title:`En savoir plus - nouvelle fenêtre` ,
                  "aria-label":`En savoir plus - nouvelle fenêtre`,
                  target:'_blank'
                }: {
                  href: data.attributes.link,
                }
              }
            >
              En savoir plus
            </Button>
          }
          {data.attributes.file.data &&
            <div className={fr.cx('fr-card','fr-enlarge-link', 'fr-card--download')}>
              <div className={fr.cx('fr-card__body')}>
                <div className={fr.cx('fr-card__content')}>
                  <div className={fr.cx('fr-card__title')}>
                      <a download href={data.attributes.file.data.attributes.url}>
                          {`Télécharger la ressource${data.attributes.file.data.attributes.name}`}
                      </a>
                  </div>
                  <div className={fr.cx('fr-card__end')}>
                      <p className={fr.cx('fr-card__detail')}>{`${data.attributes.file.data.attributes.ext} – ${data.attributes.file.data.attributes.size/100} Mo`}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
      </div>
    </article>
  );
}