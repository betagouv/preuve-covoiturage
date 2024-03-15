import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import RessourceCard from "@/components/ressources/RessourceCard";
import { fetchAPI, cmsRessourcesByPage } from "@/helpers/cms";
import Pagination from "@/components/common/Pagination";
import CategoryTags from '@/components/common/CategoryTags';

export async function generateMetadata({ params }: { params: { slug: string, id: string }}) {
  const query = {
    filters: {
      slug: {
        $eq: params.slug,
      }
    }
  };
  const {data} =  await fetchAPI('/categories',query);  
  return {
    title: `Ressources page ${params.id} pour la catégorie ${data ? data[0].attributes.label : ''}| Observatoire.covoiturage.gouv.fr`,
    description: `Page ${params.id} des ressources sur le covoiturage de courte distance pour la catégorie ${data ? data[0].attributes.label : ''}`,
  }
}

export async function generateStaticParams() {
  const categories =  await fetchAPI('/categories',{
    fields: 'slug',
    filters:{
      resources:{
        id:{
          $notNull: true
        }
      }
    }
  });
  const data = await Promise.all(categories.data.map(async (c:any) => {
    const query = {
      filter:{
        categories:{
          slug:{
            $eq: c.attributes.slug
          }
        }
      },
      pagination: {
        pageSize: cmsRessourcesByPage
      }
    };
    const { meta }  = await fetchAPI('/resources',query);
    const nbPage = meta.pagination.pageCount;
    return Array.from({ length: nbPage }, (_, v) => {
      const id = v + 1;
      return {
        slug: c.attributes.slug,
        id: id.toString(),
      }
    })
  }))
  return data.flat()
}

export default async function RessourceCategoriePage({ params }: { params: { slug: string, id: string }}) {

  const query = {
    populate: 'img,file',
    sort:'public_date:desc',
    filters:{
      categories:{
        slug:{
          $eq: params.slug
        }
      }
    },
    pagination: {
      pageSize: cmsRessourcesByPage,
      page: params.id,
    }
  };
  const { data, meta }  = await fetchAPI('/resources',query);
  const catQuery = {
    filters:{
      resources:{
        id:{
          $notNull: true
        }
      }
    }
  }
  const categories =  await fetchAPI('/categories',catQuery);
  const nbPage = meta ? meta.pagination.pageCount : 1;
  const pageTitle= `Ressources de la catégorie ${categories.data.find((c:any) => c.attributes.slug = params.slug).attributes.label} page ${params.id}`; 

  return (
    <div id='content'>
      <PageTitle title={pageTitle} />
      <div className={fr.cx('fr-grid-row','fr-mb-3w')}>
        {categories.data && <CategoryTags categories={categories.data} active={params.slug} type={'ressources'} page={params.id}/>}
      </div>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a:any, i:number) => {
            return (
              <div key={i} className={fr.cx('fr-col-12','fr-col-md-6')}>
                <RessourceCard 
                  title={a.attributes.title}
                  content={a.attributes.content}
                  date={new Date(a.attributes.public_date).toLocaleDateString('fr-FR')}
                  href={`/ressources/${a.attributes.slug}`}
                  img={a.attributes.img.data ? a.attributes.img.data.attributes.url : null} 
                />
              </div>
            )
          })
        }
      </div>
      <Pagination
        count={nbPage}
        defaultPage={Number(params.id)}
        href={`/ressources`}
      />    
    </div>
  );
}