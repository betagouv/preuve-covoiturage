import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import ActuCard from "@/components/actualites/ActuCard";
import { cmsHost, cmsInstance, cmsActusByPage, shorten, getNbPages } from "@/helpers/cms";
import Pagination from "@/components/common/Pagination";
import CategoryTags from "@/components/actualites/CategoryTags";

export async function generateMetadata({ params }: { params: { id: string }}) {
  return {
    title: `Actualités page ${params.id} | Covoiturage courte distance`,
    description: `Page ${params.id} des actualités sur le covoiturage de courte distance`,
  }
}

export async function generateStaticParams() {
  const { meta } = await cmsInstance.items('Articles').readByQuery({
    fields:'id',
    limit: cmsActusByPage,
    filter:{
      status: {
        '_eq': 'published',
      }
    },
    meta:'filter_count',
  });
  const nbPage = meta && meta.filter_count ? Math.ceil(meta.filter_count/cmsActusByPage) : 1
  return Array.from({ length: nbPage }, (_, v) => {
    const id = v + 1;
    return {
      id: id.toString(),
    }
  });
}

export default async function ActuPage({ params }: { params: { id: string }}) {
  const { data, meta } = await cmsInstance.items('Articles').readByQuery({
    fields:'*, categories.Categories_id.*',
    limit: cmsActusByPage,
    page: Number(params.id),
    filter:{
      status: {
        '_eq': 'published',
      },
    },
    sort:['-date_created'] as never[],
    meta:'filter_count',
  });

  const categories =  await cmsInstance.items('Categories').readByQuery({
    fields:'*',
    meta:'*',
  });

  const content = {
    pageTitle: `Actualités page ${params.id}`,  
  };

  const nbPage = meta && meta.filter_count ? getNbPages(meta.filter_count, cmsActusByPage) : 1

  return (
    <article id='content'>
      <PageTitle title={content.pageTitle} />
      <div className={fr.cx('fr-grid-row','fr-mb-3w')}>
        {categories.data && <CategoryTags categories={categories.data} />}
      </div>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a, i) => {
            if (i <= 1) return (
              <div key={i} className={fr.cx('fr-col-12','fr-col-md-6')}>
                <ActuCard 
                  title={a.title}
                  content={shorten(a.description,250)}
                  date={new Date(a.date_created).toLocaleDateString('fr-FR')}
                  href={`/actualites/${a.slug}`}
                  img={`${cmsHost}/assets/${a.img}`}
                  img_legend={a.img_legend}
                  categories={a.categories}
                  horizontal
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
    </article>
  );
}
