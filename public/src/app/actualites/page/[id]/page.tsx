import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import ActuCard from "@/components/actualites/ActuCard";
import { fetchAPI, cmsActusByPage, shorten } from "@/helpers/cms";
import Pagination from "@/components/common/Pagination";
import CategoryTags from "@/components/actualites/CategoryTags";

export async function generateMetadata({ params }: { params: { id: string }}) {
  return {
    title: `Actualités page ${params.id} | Observatoire.covoiturage.gouv.fr`,
    description: `Page ${params.id} des actualités sur le covoiturage de courte distance`,
  }
}

export async function generateStaticParams() {
  const query = {
    pagination: {
      pageSize: cmsActusByPage
    }
  };
  const { meta }  = await fetchAPI('/articles',query);
  const nbPage = meta ? meta.pagination.pageCount : 1;
  return Array.from({ length: nbPage }, (_, v) => {
    const id = v + 1;
    return {
      id: id.toString(),
    }
  });
}

export default async function ActuPage({ params }: { params: { id: string }}) {
  const query = {
    populate: 'articles,img',
    sort:'createdAt:desc',
    pagination: {
      pageSize: cmsActusByPage,
      page: params.id,
    }
  };
  const { data, meta }  = await fetchAPI('/articles',query);
  const categories =  await fetchAPI('/categories?filters[articles]');
  const pageTitle=`Actualités page ${params.id}`;
  const nbPage = meta ? meta.pagination.pageCount : 1;

  return (
    <div id='content'>
      <PageTitle title={pageTitle} />
      <div className={fr.cx('fr-grid-row','fr-mb-3w')}>
        {categories.data && <CategoryTags categories={categories.data} />}
      </div>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a:any, i:number) => {
            return (
              <div key={i} className={fr.cx('fr-col-12','fr-col-md-6')}>
                <ActuCard 
                  title={a.attributes.title}
                  content={shorten(a.attributes.description,250)}
                  date={new Date(a.attributes.date_created).toLocaleDateString('fr-FR')}
                  href={`/actualites/${a.attributes.slug}`}
                  img={a.attributes.img.data.attributes.url}
                  img_legend={a.attributes.img_legend}
                  categories={a.attributes.categories}
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
