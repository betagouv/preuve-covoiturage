import PageTitle from '@/components/common/PageTitle';
import SectionTitle from '@/components/common/SectionTitle';
import IndicatorsRow from '@/components/observatoire/indicators/IndicatorsRow';
import { SingleIndicatorProps } from '@/components/observatoire/indicators/SingleIndicator';
import { AnalyseProps } from '@/components/observatoire/indicators/Analyse';
import Hero, { HeroProps } from '@/components/common/Hero';
import { ButtonProps } from '@codegouvfr/react-dsfr/Button';

export type Content = {
  pageTitle: string;
  hero: HeroProps;
  sections: {
    title: string;
    rows: {
      indicators: SingleIndicatorProps[];
      analyse?: AnalyseProps;
    }[];
  }[];
}

export default function Page() {
  const content:Content = {
    pageTitle: 'Comprendre la pratique du covoiturage en France',
    hero:{
      title: 'Le covoiturage, qu’est-ce que c’est ?',
      content: `L’article L. 3132-1 du code des transports définit le covoiturage comme « l’utilisation en commun 
      d’un véhicule terrestre à moteur par un conducteur et un ou plusieurs passagers, effectuée à titre non onéreux,
       excepté le partage des frais, dans le cadre d’un déplacement que le conducteur effectue pour son propre compte.
       Leur mise en relation, à cette fin, peut être effectuée à titre onéreux […] ». Il y a donc covoiturage dès le partage
       d’un trajet entre un conducteur et un passager. En conséquence, le covoiturage peut donc être interne à la famille ou 
       extra familial tel que pour des trajets réalisés dans le cadre de sorties de loisirs proches (réunion associative, etc.) 
       ou plus éloignées (balade, cinéma, piscine, salle de sport, etc.).`,
      buttons:[
        {
          children: 'Button 1 label',
          iconId: 'fr-icon-git-commit-fill',
          linkProps: {
            href: '#'
          }
        },
        {
          children: 'Button 2 label (longer)',
          iconId: 'fr-icon-chat-check-fill',
          linkProps: {
            href: '#'
          },
          priority: 'secondary'
        },
        {
          children: 'Button 3 label',
          iconId: 'fr-icon-bank-card-line',
          linkProps: {
            href: '#'
          }
        }
      ]
    },
    sections: [
      {
        title:'Environ 900 000 trajets covoiturés chaque jour',
        rows: [
          {
            indicators: [
              { value: '59%', title: 'des déplacements en voiture sont réalisés à plusieurs' },
              { value: '1,43', title: 'personnes par véhicule sur des distances inférieur à 100 km' },
            ],
            analyse: {
              title: 'Analyse',
              content: `En 2019, 59 % des déplacements en voiture sont effectués à plusieurs. Le covoiturage reste en revanche
              une pratique peu développée puisque seuls 3 % des passagers déclarent avoir covoituré pour leurs
              déplacements en voiture. L’usage individuel du véhicule, désigné par le terme d’« autosolisme » est
              majoritaire pour les déplacements en voiture de moins de 50 km.`,
            },
          }
        ]
      },
      {
        title:'Répartition des pratiques du covoiturage :',
        rows: [
          {
            indicators: [
              { value: '95%', title: 'de la pratique se fait de façon informelle' },
            ],
            analyse: {
              title: 'Covoiturage informel',
              content: `C'est la forme de covoiturage la plus répendue, Elle s’effectue en famille, avec ses collègues de travail ou ses amis. 
              Elle est la plupart du temps gratuite pour le passager. Il est difficile de l'étudier car il est nécessaire de mettre en place 
              des enquêtes lourdes et coûteuse afin d'analyser sa pratique par les français.`,
            },
          },
          {
            indicators: [
              { value: '5%', title: 'de la pratique utilise une plateforme numérique dédiée' },
            ],
            analyse: {
              title: 'Covoiturage utilisant une plateforme numérique dédiée',
              content: `Cette forme de covoiturage est plus facile à étudier depuis la mise en place du registre de preuve de covoiturage qui collecte 
              depuis 2020 tous les trajets effectués via les opérateurs de covoiturage. Même si les indicateurs produits ne reflètent qu’une petite partie
              de la pratique, ils permettent de suivre plus régulièrement les tendances et peuvent mettre en évidence certains phénomènes très fin sur 
              les territoires.`,
              link: {
                title:'En savoir plus',
                url:'/observatoire/territoire',
              }
            },
          }
        ]
      },
      {
        title:'Infrastructures dédiées',
        rows: [
          {
            indicators: [
              { value: '8500', title: 'Aires de covoiturage' },
              { value: '20', title: 'Lignes de covoiturage' },
              { value: '7', title: 'Voies de covoiturage' },
            ],
          }
        ]
      },
    ]
  }

  return (
    <article id='content'>
      <PageTitle title={content.pageTitle} />
      <Hero title={content.hero.title} content={content.hero.content} buttons={content.hero.buttons as [ButtonProps, ...ButtonProps[]]} />
      {content.sections.map( (d, i) => {
        return (
          <>
            <SectionTitle key={i} title={d.title} />
            {d.rows.map((r,index) => {
              return <IndicatorsRow key={index} indicators={r.indicators} analyse={r.analyse} />
            })}
          </>
        )
      })}
      
    </article>
  );
}
