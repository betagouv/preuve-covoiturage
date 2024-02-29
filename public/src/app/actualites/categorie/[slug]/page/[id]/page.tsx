import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import ActuCard from "@/components/actualites/ActuCard";
import { fetchAPI, cmsActusByPage, shorten } from "@/helpers/cms";
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
    title: `Actualités page ${params.id} pour la catégorie ${data ? data[0].attributes.label : ''}| Observatoire.covoiturage.gouv.fr`,
    description: `Page ${params.id} des actualités sur le covoiturage de courte distance pour la catégorie ${data ? data[0].attributes.label : ''}`,
  }
}

export async function generateStaticParams() {
  const categories =  await fetchAPI('/categories',{
    fields: 'slug',
    filters:{
      articles:{
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
        pageSize: cmsActusByPage
      }
    };
    const { meta }  = await fetchAPI('/articles',query);
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

export default async function ActuCategoriePage({ params }: { params: { slug: string, id: string }}) {

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
      pageSize: cmsActusByPage,
      page: params.id,
    }
  };
  const { data, meta }  = await fetchAPI('/articles',query);
  const catQuery = {
    filters:{
      articles:{
        id:{
          $notNull: true
        }
      }
    }
  }
  const categories =  await fetchAPI('/categories',catQuery);
  const nbPage = meta ? meta.pagination.pageCount : 1;
  const pageTitle= `Actualités de la catégorie ${categories.data.find((c:any) => c.attributes.slug = params.slug).attributes.label} page ${params.id}`; 

  return (
    <div id='content'>
      <PageTitle title={pageTitle} />
      <div className={fr.cx('fr-grid-row','fr-mb-3w')}>
        {categories.data && <CategoryTags categories={categories.data} active={params.slug} page={params.id}/>}
      </div>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a:any, i:number) => {
            return (
              <div key={i} className={fr.cx('fr-col-12','fr-col-md-6')}>
                <ActuCard 
                  title={a.attributes.title}
                  content={shorten(a.attributes.description,250)}
                  date={new Date(a.attributes.createdAt).toLocaleDateString('fr-FR')}
                  href={`/actualites/${a.attributes.slug}`}
                  img={a.attributes.img.data.attributes.formats.medium ? a.attributes.img.data.attributes.formats.medium.url : a.attributes.img.data.attributes.url}
                  img_legend={a.attributes.img_legend}
                  categories={a.attributes.categories.data}
                />
              </div>
            )
          })
        }
      </div>
      <Pagination
        count={nbPage}
        defaultPage={Number(params.id)}
        href={`/actualites`}
      />    
    </div>
  );
}