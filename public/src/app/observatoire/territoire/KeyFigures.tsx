import IndicatorsRow from '@/components/observatoire/indicators/IndicatorsRow';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { IndicatorProps, SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import { KeyFiguresDataInterface } from '@/interfaces/observatoire/dataInterfaces';

export default function KeyFigures({ params }: { params: SearchParamsInterface }) {
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/monthly-keyfigures?code=${params.code}&type=${params.type}&year=${params.year}&month=${params.month}`;
  const { data } = useApi<KeyFiguresDataInterface[]>(url);
  const row1 = data
    ? [
        { value: data[0].journeys.toLocaleString(), text: 'Covoiturages réalisés', icon:'airport_shuttle', },
        {
          value: `${((data[0].has_incentive / data[0].journeys) * 100).toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
          })}`,
          unit:'%',
          text: 'Trajets incités',
          icon:'euro',
        },
        {
          value: `${((data[0].intra_journeys / data[0].journeys) * 100).toLocaleString('fr-FR', {
            maximumFractionDigits: 1,
          })}`,
          unit:'%',
          text: 'Trajets réalisés à l\'intérieur du territoire',
          icon:'mobiledata_off',
        },
      ] as IndicatorProps[]
    : [];

  const row2 = data
    ? [
        { value: `${data[0].occupation_rate.toLocaleString()}`,
          text: "personnes par véhicule",
          icon:'supervised_user_circle',
        },
        {
          value: `${Math.round(data[0].distance / data[0].passengers).toLocaleString()}`,
          unit:'km',
          text: 'Distance moyenne',
          icon:'conversion_path'
        },
        {
          value: `${Math.round(data[0].duration / data[0].passengers).toLocaleString()}`,
          unit:'min',
          text: 'Temps moyen des trajets',
          icon:'av_timer'
        },
        { 
          value: Math.round(data[0].distance * 0.000195).toLocaleString(), 
          text: 'Tonnes de CO₂ économisés',
          icon: 'onsen'
        },
      ] as IndicatorProps[]
    : [];

  return (
    <>
      <IndicatorsRow indicators={row1} />
      <IndicatorsRow indicators={row2} />
    </>
  );
}
