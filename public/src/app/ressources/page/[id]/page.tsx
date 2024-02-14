import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import RessourceCard from "@/components/ressources/RessourceCard";
import { fetchAPI, cmsRessourcesByPage } from "@/helpers/cms";
import Pagination from "@/components/common/Pagination";
import CategoryTags from '../../../../components/actualites/CategoryTags';

export async function generateMetadata({ params }: { params: { id: string }}) {
  return {
    title: `Ressources page ${params.id} | Observatoire.covoiturage.gouv.fr`,
    description: `Page ${params.id} des ressources sur le covoiturage de courte distance`,
  }
}

export async function generateStaticParams() {
  const query = {
    pagination: {
      pageSize: cmsRessourcesByPage
    }
  };
  const { meta }  = await fetchAPI('/resources',query);
  const nbPage = meta.pagination.pageCount;
  return Array.from({ length: nbPage }, (_, v) => {
    const id = v + 1;
    return {
      id: id.toString(),
    }
  });
}

export default async function RessourcePage({ params }: { params: { id: string }}) {

  const query = {
    populate: 'img,file',
    sort:'public_date:desc',
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
  const nbPage = meta.pagination.pageCount;
  const pageTitle= `Ressources page ${params.id}`; 


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
                <RessourceCard 
                  title={a.attributes.title}
                  content={a.attributes.content}
                  date={new Date(a.attributes.public_date).toLocaleDateString('fr-FR')}
                  link={a.attributes.link}
                  file={a.attributes.file}
                  img={a.attributes.img.data.attributes.url}
                  img_legend={a.attributes.img_legend}
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