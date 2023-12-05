import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import ActuCard from "@/components/actualites/ActuCard";
import { cmsHost, cmsInstance, cmsActusByPage, shorten, getNbPages } from "@/helpers/cms";
import CategoryTags from "@/components/actualites/CategoryTags";
import Pagination from "@/components/common/Pagination";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Actualités | Observatoire.covoiturage.gouv.fr',
  description: 'Toutes les actualités sur le covoiturage de courte distance',
}

export default async function Actualites() {
  const { data, meta } = await cmsInstance.items('Articles').readByQuery({
    fields:'*, categories.Categories_id.*',
    limit: cmsActusByPage,
    filter:{
      status: {
        '_eq': 'published',
      },
    },
    sort:['-date_created'] as never[],
    meta:'filter_count',
  });
  const pageTitle = 'Actualités';
  const categories =  await cmsInstance.items('Categories').readByQuery({
    fields:'*',
    meta:'filter_count',
  });
  const nbPage = meta && meta.filter_count ? getNbPages(meta.filter_count, cmsActusByPage) : 1

  return (
    <article id='content'>
      <PageTitle title={pageTitle} />
      <div className={fr.cx('fr-grid-row','fr-mb-3w')}>
        {categories.data && <CategoryTags categories={categories.data} />}
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
        href={`/actualites`}
      />   
    </article>
  );
}
