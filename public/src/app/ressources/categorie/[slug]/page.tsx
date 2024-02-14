import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import ActuCard from "@/components/actualites/ActuCard";
import { fetchAPI, cmsRessourcesByPage, shorten } from "@/helpers/cms";
import CategoryTags from "@/components/actualites/CategoryTags";
import Pagination from "@/components/common/Pagination";

export async function generateMetadata({ params }: { params: { slug: string }}) {
  const query = {
    filters: {
      slug: {
        $eq: params.slug,
      }
    }
  };
  const {data} =  await fetchAPI('/categories',query);
  return {
    title: `Catégorie ${data ? data[0].attributes.label : ''} des ressources | Observatoire.covoiturage.gouv.fr`,
    description: `Catégorie ${data ? data[0].attributes.label : ''} des ressources sur le covoiturage de courte distance`,
  }
}

export async function generateStaticParams() {
  const query = {
    fields: 'slug',
  };
  const {data} =  await fetchAPI('/categories',query);
  
  return data.map((post:any) => ({
    slug: post.attributes.slug,
  }))
}

export default async function ResourceCategoryPage({ params }: { params: { slug: string }}) {
  const query = {
    populate: 'categories,img,file',
    filters:{
      categories:{
        slug:{
          $eq: params.slug
        }
      }
    },
    sort:'public_date:desc',
    pagination: {
      pageSize: cmsRessourcesByPage,
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
  const pageTitle = 'Ressources';
  const nbPage = meta.pagination.pageCount;

  return (
    <div id='content'>
      <PageTitle title={pageTitle} />
      <div className={fr.cx('fr-grid-row','fr-mb-3w')}>
        {categories.data && <CategoryTags categories={categories.data} active={params.slug} />}
      </div>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a:any, i:number) => {
            return (
              <div key={i} className={fr.cx('fr-col-12','fr-col-md-6')}>
                <ActuCard 
                  title={a.attributes.title}
                  content={shorten(a.attributes.content,250)}
                  date={new Date(a.attributes.public_date).toLocaleDateString('fr-FR')}
                  href={`/resources/${a.attributes.slug}`}
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
        href={`/actualites/categorie/${params.slug}`}
      />     
    </div>
  );
}
