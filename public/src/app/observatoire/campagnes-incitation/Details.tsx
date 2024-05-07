import Rows from '@/components/observatoire/indicators/Rows';
import { IndicatorProps } from '@/interfaces/observatoire/componentsInterfaces';
import SectionTitle from '@/components/common/SectionTitle';

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
      value: Number(data.budget).toLocaleString(),
      unit: '€',
      text: 'Budget de la campagne',
      icon:'ri-money-euro-circle-line',
    },
    { __component: 'row.indicator',
      value: data.operateurs,
      text: 'comme opérateur(s)',
      icon:'ri-shake-hands-line',
    }
  ] as IndicatorProps[];

  return (
    <>
      <SectionTitle
        title={title}
      />
      <Rows data={row1} />
    </>
  );
}