import AppMap from '@/components/observatoire/maps/Map';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { fr } from '@codegouvfr/react-dsfr';
import bbox from '@turf/bbox';
import { feature, featureCollection } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { LngLatBoundsLike, MapLayerMouseEvent } from 'maplibre-gl';
import { useCallback, useMemo, useState, useContext } from 'react';
import { FillLayer, Layer, Popup, Source } from 'react-map-gl/maplibre';
import { DashboardContext } from '@/context/DashboardProvider';
import DownloadButton from '@/components/observatoire/DownloadButton';


export default function IncentiveMap({ title }: { title: string }) {
  const { dashboard } =useContext(DashboardContext);
  const mapTitle = title;
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/all-campaigns${dashboard.params.code !== 'XXXXX' ?`?code=${dashboard.params.code}&type=${dashboard.params.type}`: ''}`;
  const { data, error, loading } = useApi<any[]>(url);
  const geojson = useMemo(() => {
    const campaignsData = data ? data : [];
    return featureCollection(
      campaignsData.map((d) =>
        feature(d.geom, {
          type: d.type,
          code: d.code,
          debut: d.date_debut,
          fin: d.date_fin,
          budget: d.budget_incitations,
        }),
      ),
    ) as FeatureCollection;
  }, [data]);

  const countryLayer: FillLayer = {
    id: 'country',
    source:'campaigns',
    type: 'fill',
    paint: {
      'fill-color': '#020C7C',
      'fill-opacity': 0.6,
    },
    filter:['all',
      [ '==', 'type', 'country'],
    ],
  };
  const regLayer: FillLayer = {
    id: 'reg',
    source:'campaigns',
    type: 'fill',
    paint: {
      'fill-color': '#020C7C',
      'fill-opacity': 0.6,
    },
    filter:['all',
      [ '==', 'type', 'reg'],
    ],
  };
  const depLayer: FillLayer = {
    id: 'dep',
    source:'campaigns',
    type: 'fill',
    paint: {
      'fill-color': '#020C7C',
      'fill-opacity': 0.6,
    },
    filter:['all',
      [ '==', 'type', 'dep'],
    ],
  };
  const aomLayer: FillLayer = {
    id: 'aom',
    source:'campaigns',
    type: 'fill',
    paint: {
      'fill-color': '#020C7C',
      'fill-opacity': 0.6,
    },
    filter:['all',
      [ '==', 'type', 'aom'],
    ],
  };
  const epciLayer: FillLayer = {
    id: 'epci',
    source:'campaigns',
    type: 'fill',
    paint: {
      'fill-color': '#020C7C',
      'fill-opacity': 0.6,
    },
    filter:['all',
      [ '==', 'type', 'epci'],
    ],
  };

  const mapStyle = Config.get<string>('observatoire.mapStyle');  

  const bounds = useMemo(() => {
    const bounds = dashboard.params.code === 'XXXXX' ? [-5.225, 41.333, 9.55, 51.2] : bbox(geojson);
    return bounds as LngLatBoundsLike;
  },[dashboard.params.code, geojson]);

  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number,
    latitude: number,
    properties: any
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
  const onMouseMove = useCallback((e:MapLayerMouseEvent) =>  {
    e.features && e.features.length > 0 ? setHoverInfo({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: e.features[0].properties
    }) : undefined
   }, [])

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
      {!loading && !error && geojson.features.length === 0 && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>{`Ce territoire n'a pas encore réalisé de campagne d'incitation au covoiturage quotidien`}</div>
        </div>
      )}
      {!loading && !error && geojson.features.length > 0 && (
        <AppMap 
        title={mapTitle} 
        mapStyle={mapStyle} 
        bounds={bounds} 
        scrollZoom={false} 
        interactiveLayerIds={['country','reg','dep','aom','epci']}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        download={
          <DownloadButton 
            title={'Télécharger les données de la carte'}
            data={geojson as FeatureCollection}
            type={'geojson'}
            filename='occupation'
          />
        }
        >
          <Source id='campaigns' type='geojson' data={geojson}>
            <Layer {...countryLayer} />
            <Layer {...regLayer} />
            <Layer {...depLayer} />
            <Layer {...aomLayer} />
            <Layer {...epciLayer} />
            <Popup longitude={hoverInfo ? hoverInfo.longitude : 0} latitude={hoverInfo ? hoverInfo.latitude : 0} closeButton={false}>
              {hoverInfo && 
                <div>
                  {hoverInfo.properties.fin && hoverInfo.properties.debut && <p>Campagne active du <b>{hoverInfo.properties.debut} au {hoverInfo.properties.fin}</b></p>}
                  {hoverInfo.properties.budget && <p>Budget de la campagne : <b>{hoverInfo.properties.budget} €</b></p>}
                </div>
              }
            </Popup>
          </Source>
        </AppMap>
      )}
    </>
  );
}
