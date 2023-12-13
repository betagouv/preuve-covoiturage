import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import RessourceCard from "@/components/ressources/RessourceCard";
import { cmsInstance, cmsHost, getNbPages, cmsRessourcesByPage } from "@/helpers/cms";
import Pagination from "@/components/common/Pagination";

export async function generateMetadata({ params }: { params: { id: string }}) {
  return {
    title: `Ressources page ${params.id} | Observatoire.covoiturage.gouv.fr`,
    description: `Page ${params.id} des ressources sur le covoiturage de courte distance`,
  }
}

export async function generateStaticParams() {
  const { meta } = await cmsInstance.items('Ressources').readByQuery({
    fields:'id',
    limit: cmsRessourcesByPage,
    filter:{
      status: {
        '_eq': 'published',
      }
    },
    meta:'filter_count',
  });
  const nbPage = meta && meta.filter_count ? Math.ceil(meta.filter_count/cmsRessourcesByPage) : 1
  return Array.from({ length: nbPage }, (_, v) => {
    const id = v + 1;
    return {
      id: id.toString(),
    }
  });
}

export default async function RessourcePage({ params }: { params: { id: string }}) {

  const { data, meta } = await cmsInstance.items('Ressources').readByQuery({
    fields:'*,img.*,file.*',
    limit: cmsRessourcesByPage,
    filter:{
      status: {
        '_eq': 'published',
      },
    },
    sort:['-date_publi'] as never[],
    page:Number(params.id),
    meta:'filter_count',
  });

  const pageTitle= `Ressources page ${params.id}`; 
  const nbPage = meta && meta.filter_count ? getNbPages(meta.filter_count, cmsRessourcesByPage) : 1

  return (
    <div id='content'>
      <PageTitle title={pageTitle} />
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a, i) => {
            return (
              <div key={i} className={fr.cx('fr-col', 'fr-col-md-12')}>
                <RessourceCard 
                  title={a.title}
                  content={a.content}
                  date={new Date(a.date_publi).toLocaleDateString('fr-FR')}
                  link={a.link}
                  file={a.file ? `${cmsHost}/assets/${a.file}` : undefined}
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
        defaultPage={Number(params.id)}
        href={`/ressources`}
      />    
    </div>
  );
}