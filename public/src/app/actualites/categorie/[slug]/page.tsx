import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import ActuCard from "@/components/actualites/ActuCard";
import { cmsHost, cmsInstance, cmsActusByPage, shorten, getNbPages } from "@/helpers/cms";
import CategoryTags from "@/components/actualites/CategoryTags";
import Pagination from "@/components/common/Pagination";

export async function generateMetadata({ params }: { params: { slug: string }}) {
  const { data } = await cmsInstance.items('Categories').readByQuery({
    fields:'*',
    filter: {
      slug: { _eq: params.slug },
    },
    limit: 1,
  });
  return {
    title: `Catégorie ${data ? data[0].name : ''} des actualités | Observatoire.covoiturage.gouv.fr`,
    description: `Catégorie ${data ? data[0].name : ''} des actualités sur le covoiturage de courte distance`,
  }
}

export async function generateStaticParams() {
  const { data } = await cmsInstance.items('Categories').readByQuery({
    fields:'slug',
    meta:'filter_count',
  });
  return data ? data.map((post:any) => ({
    slug: post.slug,
  })) : []
}

export default async function ActuCategoryPage({ params }: { params: { slug: string }}) {
  const { data, meta } = await cmsInstance.items('Articles').readByQuery({
    fields:'*, categories.Categories_id.*',
    limit:cmsActusByPage,
    filter:{
      status: {
        '_eq': 'published',
      },
      categories:{
        Categories_id:{
          slug:{
            '_in':params.slug
          }
        }
      }
    },
    sort:['-date_created'] as never[],
    meta:'filter_count',
  });

  const content = {
    pageTitle: `Actualités`,  
  };
  const categories =  await cmsInstance.items('Categories').readByQuery({
    fields:'*',
    meta:'*',
  });
  const nbPage = meta && meta.filter_count ? getNbPages(meta.filter_count, cmsActusByPage) : 1

  return (
    <div id='content'>
      <PageTitle title={content.pageTitle} />
      <div className={fr.cx('fr-grid-row','fr-mb-3w')}>
        {categories.data && <CategoryTags categories={categories.data} active={params.slug} />}
      </div>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a, i) => {
            return (
              <div key={i} className={fr.cx('fr-col-12','fr-col-md-6')}>
                <ActuCard 
                  title={a.title}
                  content={shorten(a.description,250)}
                  date={new Date(a.date_created).toLocaleDateString('fr-FR')}
                  href={`/actualites/${a.slug}`}
                  img={`${cmsHost}/assets/${a.img}`}
                  img_legend={a.img_legend}
                  categories={a.categories}
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
