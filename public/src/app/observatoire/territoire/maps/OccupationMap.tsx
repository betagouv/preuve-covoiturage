import AppMap from '@/components/observatoire/maps/Map';
import { Config } from '@/config';
import { getLegendClasses } from '@/helpers/analyse';
import { useApi } from '@/hooks/useApi';
import { ClasseInterface, SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import type { OccupationDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { AnalyseInterface } from '@/interfaces/observatoire/helpersInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import bbox from '@turf/bbox';
import { feature, featureCollection } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { LngLatBoundsLike } from 'maplibre-gl';
import { useCallback, useMemo, useState } from 'react';
import { CircleLayer, Layer, Popup, Source } from 'react-map-gl/maplibre';

export default function OccupationMap({ title, params }: { title: string; params: SearchParamsInterface }) {
  const mapTitle = title;
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/monthly-occupation?code=${params.code}&type=${params.type}&observe=${params.observe}&year=${params.year}&month=${params.month}`;
  const { data, error, loading } = useApi<OccupationDataInterface[]>(url);
  const geojson = useMemo(() => {
    const occupationData = data ? data : [];
    return featureCollection(
      occupationData.map((d) =>
        feature(d.geom, {
          territory: d.territory,
          l_territory: d.l_territory,
          journeys: d.journeys,
          occupation_rate: d.occupation_rate,
        }),
      ),
    ) as unknown as FeatureCollection;
  }, [data]);

  const layer: CircleLayer = {
    id: 'occupation',
    source:'occupation',
    type: 'circle',
    paint: {
      'circle-radius': {
        property: 'journeys',
        type: 'exponential',
        stops: [
          [0, 0],
          [10, 5],
          [100, 10],
          [10000, 20],
          [100000, 40],
        ],
      },
      'circle-color': {
        property: 'occupation_rate',
        type: 'exponential',
        stops: [
          [2, '#E5E5F4'],
          [2.25, '#9A9AFF'],
          [2.5, '#7F7FC8'],
          [2.75, '#000091'],
          [3, '#000074'],
          [4, '#00006D'],
        ],
      },
      'circle-stroke-color': 'black',
      'circle-stroke-width': 1,
      'circle-opacity': 0.8,
    },
  };

  const mapStyle = Config.get<string>('observatoire.mapStyle');

  const analyse: AnalyseInterface[] = [
    { color: [229, 229, 244], val: 2, width: 10},
    { color: [154, 154, 255], val: 2.25, width: 10},
    { color: [127, 127, 200], val: 2.5, width: 10},
    { color: [0, 0, 145], val: 2.75, width: 10},
    { color: [0, 0, 116], val: 3, width: 10},
    { color: [0, 0, 109], val: 4, width: 10},
  ];

  const classes: ClasseInterface[] = [
    { color: [229, 229, 224], val: '>= 100 000', width: 40},
    { color: [229, 229, 224], val: '10 000', width: 20},
    { color: [229, 229, 224], val: '100', width: 10},
    { color: [229, 229, 224], val: '10', width: 5},
    ];
   

  const bounds = useMemo(() => {
    const bounds = params.code === 'XXXXX' ? [-5.225, 41.333, 9.55, 51.2] : bbox(geojson);
    return bounds as unknown as LngLatBoundsLike;
  },[params.code, geojson]);

  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number,
    latitude: number,
    properties: OccupationDataInterface
  } | undefined>();
  const [cursor, setCursor] = useState<string>('');
  const onMouseEnter = useCallback((e:any) => {
    setCursor('pointer');
    setHoverInfo({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: e.features[0].properties
    });
  }, []);
  const onMouseLeave = useCallback(() => {
    setCursor('');
    setHoverInfo(undefined);
  }, []);
  
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
        <AppMap 
        title={mapTitle} 
        mapStyle={mapStyle} 
        bounds={bounds} 
        scrollZoom={false} 
        legend={
          [
            {
              title: mapTitle,
              type:'proportional_circles',
              classes: classes,
              order:1
            },
            {
              title: mapTitle,
              type:'interval',
              classes: getLegendClasses(analyse,'interval'),
              order:2
            }
          ]
        }
        interactiveLayerIds={['occupation']}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        >
          <Source id='occupation' type='geojson' data={geojson}>
            <Layer {...layer} />
            <Popup longitude={hoverInfo ? hoverInfo.longitude : 0} latitude={hoverInfo ? hoverInfo.latitude : 0} closeButton={false}>
              {hoverInfo && 
                <div>
                  {hoverInfo.properties.occupation_rate && <p><b>taux d&rsquo;ocupation des véhicules : </b>{hoverInfo.properties.occupation_rate}</p>}
                  {hoverInfo.properties.journeys && <p><b>véhicules partagés : </b>{hoverInfo.properties.journeys}</p>}
                </div>
              }
            </Popup>
          </Source>
        </AppMap>
      )}
    </>
  );
}
