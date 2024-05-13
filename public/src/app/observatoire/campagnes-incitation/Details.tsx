import Rows from '@/components/observatoire/indicators/Rows';
import { IndicatorProps } from '@/interfaces/observatoire/componentsInterfaces';
import SectionTitle from '@/components/common/SectionTitle';
import Table from '@codegouvfr/react-dsfr/Table';

export default function Details({data}:{ data:any}) {
  const title = `Campagne d'incitation active 
    ${data.debut ? 
    `${data.fin 
      ? `entre le ${data.debut} et le ${data.fin}` 
      : `depuis le ${data.debut}`}` 
    : `${data.fin ?
      `jusqu'au ${data.fin}` 
      : `de période inconnue`}`
    }
  `;
  const row1 = [
    { __component: 'row.indicator',
      value: data.budget ? Number(data.budget).toLocaleString() : 'Budget inconnu',
      unit: data.budget ? '€' : '',
      text: 'Budget de la campagne',
      icon:'ri-money-euro-circle-line',
    },
    { __component: 'row.indicator',
      value: data.operateurs,
      text: 'comme opérateur(s)',
      icon:'ri-shake-hands-line',
    },
    { __component: 'row.indicator',
      value: `${data.l_min} km`,
      text: ' de trajet minimum',
      icon:'ri-route-line',
    },
    { __component: 'row.indicator',
      value: `${data.l_max} km`,
      text: 'de trajet maximum',
      icon:'ri-route-line',
    }
  ] as IndicatorProps[];

  const criteres = [
    data.classe ? [
      'Classes de trajets éligibles',
      data.classe
    ] : [],
    data.p_gratuit ? [
      'Gratuité pour le passager',
      data.p_gratuit,
    ] : [],
    data.p_gratuit === 'Oui' ? [
      'Passager éligibles',
      `${data.p_eligible}`,
    ] : [],
    data.p_tk === 'Oui' ? [
      'Passager éligible à une réduction du montant du ticket',
      `${data.p_e_tk}`,
    ] : [],
    data.p_m_tk ? [
      'Montant (en €) du ticket passager',
      data.p_m_tk,
    ] : [],
    data.p_t_max ? [
      'Nombre de trajets maximum du passager incités chaque mois',
      data.p_t_max,
    ] : [],
    data.c_t_max ? [
      'Nombre de trajets maximum du conducteur incités chaque mois',
      data.c_t_max,
    ] : [],
    data.c_m_max ? [
      'Montant maximal d’incitation du conducteur par mois (en €)',
      data.c_m_max,
    ] : [],
    data.c_m_max_p ? [
      'Montant maximal d’incitation du conducteur par passager transporté (en €)',
      data.c_m_max_p,
    ] : [],
    data.c_m_min_p ? [
      'Montant minimum d’incitation du conducteur par passager transporté (en €)',
      data.c_m_min_p,
    ] : [],
    [
      'Sens des trajets éligibles à l\'incitation par rapport à l’AOM',
      data.sens === 'ET/OU' ? 'Origine et/ou destination' : data.sens === 'ET' ? 'Origine et destination' : 'Origine ou destination'
    ],
    data.exclusion ==='Oui' ? [
      'Zone d\'exclusion de la campagne',
      `${data.liste_exclusion} ${data.autre_exclusion && data.autre_exclusion !== 'Non' ? data.autre_exclusion : ''}` 
    ]: [],
  ]

  return (
    <>
      <SectionTitle
        title={title}
      />
      <Rows data={row1} />
      <Table
        caption="Critères de la campagne"
        fixed
        bordered
        colorVariant="blue-ecume"
        data={criteres}
        headers={[]}
      />
    </>
  );
}