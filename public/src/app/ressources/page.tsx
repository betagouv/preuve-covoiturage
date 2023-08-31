import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import RessourceCard from "@/components/ressources/RessourceCard";
import { cmsInstance, cmsHost } from "@/helpers/cms";

export default async function Ressources() {

  const { data } = await cmsInstance.items('Ressources').readByQuery({
    fields:'*,img.*,file.*',
    filter:{
      status: {
        '_eq': 'published',
      },
    },
    sort:['-date_created'] as never[],
    meta:'filter_count',
  });

  const content = {
    pageTitle: 'Ressources',  
  }

  return (
    <article id='content'>
      <PageTitle title={content.pageTitle} />
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {data &&
          data.map((a, i) => {
            return (
              <div key={i} className={fr.cx('fr-col', 'fr-col-md-12')}>
                <RessourceCard 
                  title={a.title}
                  content={a.content}
                  date={new Date(a.date_created).toLocaleDateString('fr-FR')}
                  href={`${cmsHost}/assets/${a.file.id}`}
                  img={`${cmsHost}/assets/${a.img.id}`}
                  img_legend={a.img_legend}
                  horizontal
                />
              </div>
            )
          })
        }
      </div>    
    </article>
  );
}
