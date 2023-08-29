import DeckMap from '@/components/observatoire/maps/DeckMap';
import { Config } from '@/config';
import { classColor, getPeriod, jenks } from '@/helpers/analyse';
import { useApi } from '@/hooks/useApi';
import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import type { DensiteDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import { H3HexagonLayer } from '@deck.gl/geo-layers/typed';
import bbox from '@turf/bbox';
import { multiPolygon } from '@turf/helpers';
import { cellsToMultiPolygon } from 'h3-js';
import { LngLatBoundsLike } from 'maplibre-gl';
import { useMemo } from 'react';

export default function DensiteMap({ title, params }: { title: string; params: SearchParamsInterface }) {
  const mapTitle = title;
  const period = getPeriod(params.year, params.month);
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/location?code=${params.code}&type=${params.type}&start_date=${period.start_date}&end_date=${period.end_date}&zoom=8`;
  const { data, error, loading } = useApi<DensiteDataInterface[]>(url);
  const mapStyle = Config.get<string>('observatoire.mapStyle');

  const analyse = useMemo(() => {
    return data ? jenks(
      data,
        'count',
        ['#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000', '#000000'],
        [10, 10, 10, 10, 10, 10],
      )
    : [];
  }, [data]);

  const layer = new H3HexagonLayer({
    id: 'densite-layer',
    data: data ? data : [],
    opacity: 0.4,
    pickable: true,
    extruded: false,
    lineWidthMinPixels: 1,
    getHexagon: (d) => d.hex,
    getFillColor: (d) => classColor(d.count, analyse),
    getLineColor: () => [80, 80, 80],
  });
  const bounds = () => {
    const hexagons = data?.map((d) => d.hex);
    const polygon = cellsToMultiPolygon(hexagons!, true);
    const bounds = params.code === 'XXXXX' ? [-5.225, 41.333, 9.55, 51.2] : bbox(multiPolygon(polygon));
    return bounds as unknown as LngLatBoundsLike;
  };
  const tooltip = ({ object }: any) =>
    object && {
      html: `<div><b>${object.count.toLocaleString()}</b> départ(s) ou arrivée(s) de covoiturage dans cette maille hexagonale</div>`,
      className: 'fr-callout',
      style: {
        color: '#000',
        backgroundColor: '#fff',
        fontSize: '0.8em',
        width: '250px',
        height: '80px',
        left: '-125px',
        top: '-110px',
      },
    };

  return (
    <>
      {loading && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>Chargement en cours...</div>
        </div>
      )}
      {error && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>{`Un problème est survenu au chargement des données: ${error}`}</div>
        </div>
      )}
      {!loading && !error && (
        <DeckMap 
          title={mapTitle} 
          tooltip={tooltip} 
          mapStyle={mapStyle} 
          layers={[layer]} 
          bounds={bounds()} 
          scrollZoom={false}
        />
      )}
    </>
  );
}
