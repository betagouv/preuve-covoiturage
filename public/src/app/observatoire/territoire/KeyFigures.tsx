import IndicatorsRow from '@/components/observatoire/indicators/IndicatorsRow';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import { KeyFiguresDataInterface } from '@/interfaces/observatoire/dataInterfaces';

export default function KeyFigures({ params }: { params: SearchParamsInterface }) {
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/monthly-keyfigures?code=${params.code}&type=${params.type}&year=${params.year}&month=${params.month}`;
  const { data } = useApi<KeyFiguresDataInterface[]>(url);
  const row1 = data
    ? [
        { value: data[0].journeys.toLocaleString(), title: 'Covoiturages réalisés' },
        {
          value: `${((data[0].has_incentive / data[0].journeys) * 100).toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
          })} %`,
          title: 'Trajets incités',
        },
        {
          value: `${((data[0].intra_journeys / data[0].journeys) * 100).toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
          })} %`,
          title: "Trajets réalisés à l'intérieur du territoire",
        },
      ]
    : [];

  const row2 = data
    ? [
        { value: `${data[0].occupation_rate.toLocaleString()}`, title: "personnes par véhicule" },
        {
          value: `${Math.round(data[0].distance / data[0].passengers).toLocaleString()} km`,
          title: 'Distance moyenne',
        },
        {
          value: `${Math.round(data[0].duration / data[0].passengers).toLocaleString()} min`,
          title: 'Temps moyen des trajets',
        },
        { value: Math.round(data[0].distance * 0.000195).toLocaleString(), title: 'Tonnes de CO₂ économisés' },
      ]
    : [];

  return (
    <>
      <IndicatorsRow indicators={row1} />
      <IndicatorsRow indicators={row2} />
    </>
  );
}
