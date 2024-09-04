import Rows from '@/components/observatoire/indicators/Rows';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { IndicatorProps } from '@/interfaces/observatoire/componentsInterfaces';
import { KeyFiguresDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useContext } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';

export default function KeyFigures() {
  const { dashboard } =useContext(DashboardContext);
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/monthly-keyfigures?code=${dashboard.params.code}&type=${dashboard.params.type}&year=${dashboard.params.year}&month=${dashboard.params.month}`;
  const { data } = useApi<KeyFiguresDataInterface[]>(url);
  const row1 = (data && data.length > 0)
    ? [
        { __component: 'row.indicator',
          value: data[0].journeys.toLocaleString(),
          text: 'Covoiturages réalisés',
          icon:'ri-car-line',
        },
        /*{
          value: `${((data[0].has_incentive / data[0].journeys) * 100).toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
          })}`,
          unit:'%',
          text: 'Trajets incités',
          icon:'euro',
        },*/
        { __component: 'row.indicator',
          value: `${data[0].occupation_rate.toLocaleString()}`,
          text: "personnes par véhicule",
          icon:'ri-group-2-line',
        },
        { __component: 'row.indicator',
          value: `${Math.round(data[0].distance / data[0].passengers).toLocaleString()}`,
          unit:'km',
          text: 'Distance moyenne',
          icon:'ri-signpost-line'
        },
        { __component: 'row.indicator',
          value: `${Math.round(data[0].duration / data[0].passengers).toLocaleString()}`,
          unit:'min',
          text: 'Temps moyen des trajets',
          icon:'ri-time-line'
        },
      ] as IndicatorProps[]
    : [];

  const row2 = (data && data.length > 0)
    ? [
        { __component: 'row.indicator',
          value: `${((data[0].intra_journeys / data[0].journeys) * 100).toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
          })}`,
          unit:'%',
          text: 'Trajets réalisés à l\'intérieur du territoire',
          icon:'ri-focus-line',
        },
        { __component: 'row.indicator',
          value: Math.round(data[0].distance * 0.000195).toLocaleString(), 
          text: 'Tonnes de CO₂ économisés',
          icon: 'ri-haze-line'
        },
      ] as IndicatorProps[]
    : [];

  return (
    <>
      <Rows data={row1} />
      <Rows data={row2} />
    </>
  );
}
