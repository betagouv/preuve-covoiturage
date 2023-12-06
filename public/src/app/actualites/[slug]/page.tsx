import PageTitle from "@/components/common/PageTitle";
import Share from "@/components/common/Share";
import { Config } from "@/config";
import { fr } from "@codegouvfr/react-dsfr";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Image from 'next/image';
import { cmsHost, cmsInstance, shorten } from "@/helpers/cms";
import MDContent from "@/components/common/MDContent";

export async function generateMetadata({ params }: { params: { slug: string }}) {
  const { data } = await cmsInstance.items('Articles').readByQuery({
    fields:'*',
    filter: {
      slug: { _eq: params.slug },
      status: {
        '_eq': 'published',
      },
    },
    limit: 1,
  });
  return {
    title: `${data ? data[0].title : ''} | Observatoire.covoiturage.gouv.fr`,
    description: shorten(`${data && data[0].description ? data[0].description : ''}`,150),
  }
}

export async function generateStaticParams() {
  const { data } = await cmsInstance.items('Articles').readByQuery({
    fields:'slug',
    filter:{
      status: {
        '_eq': 'published',
      }
    }
  });
  return data ? data.map((post:any) => ({
    slug: post.slug,
  })) : []
}

export default async function ActuSingle({ params }: { params: { slug: string }}) {
  const hostUrl = Config.get<string>('next.public_url', 'http://localhost:4200');
  const location = `${hostUrl}/actualites/${params.slug}`;

  const { data } = await cmsInstance.items('Articles').readByQuery({
    fields:'*,img.*,categories.Categories_id.*',
    limit:1,
    filter:{
      status: {
        '_eq': 'published',
      },
      slug: {
        '_eq': params.slug,
      },
    },
    meta:'*',
  });
  
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
      href:`mailto:?subject=${data ? data[0].title : ''}&body=${data ? data[0].description : ''} ${location}`,
    }
  ]

  return (
    <article id='actu-content'>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
      { data && 
        <div className={fr.cx('fr-col','fr-col-12')}>
          <PageTitle title={data[0].title} />
          <p>Publié le {new Date(data[0].date_created).toLocaleDateString('fr-FR')}</p>
          <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={fr.cx('fr-col','fr-col-md-9')}>
              <ul className={fr.cx('fr-tags-group')}>
                {data[0].categories &&
                  data[0].categories.map((c:any, i:number) => {
                    return (
                      <li key={i}>
                        <Tag
                          linkProps={{
                            href: `/actualites/categorie/${c.Categories_id.slug}`
                          }}
                        >
                          {c.Categories_id.name}
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
          <figure className={fr.cx('fr-content-media')} role="group" style={{textAlign:'center'}}>
            <div className={fr.cx('fr-content-media__img')}>
                <Image className={fr.cx('fr-responsive-img', 'fr-responsive-img--16x9')} src={`${cmsHost}/assets/${data[0].img.id}`} alt={data[0].img_legend} width={data[0].img.width} height={data[0].img.height} />
            </div>
            <figcaption className={fr.cx('fr-content-media__caption')}>{data[0].img_legend}</figcaption>
          </figure>
          <div>
            {data[0].description}
            <MDContent source={data[0].content} />
          </div>
        </div>
      }
      </div>
    </article>
  );
}