import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import RessourceCard from "@/components/ressources/RessourceCard";
import { cmsInstance, cmsHost, getNbPages, cmsRessourcesByPage } from "@/helpers/cms";
import Pagination from "@/components/common/Pagination";

export default async function Ressources() {

  const { data, meta } = await cmsInstance.items('Ressources').readByQuery({
    fields:'*,img.*,file.*',
    limit: cmsRessourcesByPage,
    filter:{
      status: {
        '_eq': 'published',
      },
    },
    sort:['-date_created'] as never[],
    meta:'filter_count',
  });

  const pageTitle= 'Ressources'; 
  const nbPage = meta && meta.filter_count ? getNbPages(meta.filter_count, cmsRessourcesByPage) : 1

  return (
    <article id='content'>
      <PageTitle title={pageTitle} />
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a, i) => {
            return (
              <div key={i} className={fr.cx('fr-col', 'fr-col-md-12')}>
                <RessourceCard 
                  title={a.title}
                  content={a.content}
                  date={new Date(a.date_created).toLocaleDateString('fr-FR')}
                  link={a.link}
                  file={`${cmsHost}/assets/${a.file.id}`}
                  img={`${cmsHost}/assets/${a.img.id}`}
                  img_legend={a.img_legend}
                  horizontal
                />
              </div>
            )
          })
        }
      </div>
      <Pagination
        count={nbPage}
        href={`/ressources`}
      />    
    </article>
  );
}
