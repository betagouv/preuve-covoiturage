import AppMap from '@/components/observatoire/maps/Map';
import { Config } from '@/config';
import { getLegendClasses } from '@/helpers/analyse';
import { useApi } from '@/hooks/useApi';
import { ClasseInterface } from '@/interfaces/observatoire/componentsInterfaces';
import type { OccupationDataInterface } from '@/interfaces/observatoire/dataInterfaces';
import { AnalyseInterface } from '@/interfaces/observatoire/helpersInterfaces';
import { fr } from '@codegouvfr/react-dsfr';
import bbox from '@turf/bbox';
import { feature, featureCollection } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { LngLatBoundsLike } from 'maplibre-gl';
import { useCallback, useMemo, useState, useContext } from 'react';
import { FillLayer, Layer, Popup, Source } from 'react-map-gl/maplibre';
import { DashboardContext } from '@/context/DashboardProvider';
import DownloadButton from '@/components/observatoire/DownloadButton';


export default function IncentiveMap({ title }: { title: string }) {
  const { dashboard } =useContext(DashboardContext);
  const mapTitle = title;
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/all-campaigns`;
  const { data, error, loading } = useApi<any[]>(url);
  const geojson = useMemo(() => {
    const campaignsData = data ? data : [];
    return featureCollection(
      campaignsData.map((d) =>
        feature(d.geom, {
          budget: d.budget_incitations,
        }),
      ),
    ) as unknown as FeatureCollection;
  }, [data]);

  const layer: FillLayer = {
    id: 'campaigns',
    source:'campaigns',
    type: 'fill',
    paint: {
      'fill-color': '#020C7C',
      'fill-opacity': 0.6,
    },
  };

  const mapStyle = Config.get<string>('observatoire.mapStyle');  

  const bounds = useMemo(() => {
    const bounds = dashboard.params.code === 'XXXXX' ? [-5.225, 41.333, 9.55, 51.2] : bbox(geojson);
    return bounds as unknown as LngLatBoundsLike;
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
        interactiveLayerIds={['campaigns']}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
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
            <Layer {...layer} />
            <Popup longitude={hoverInfo ? hoverInfo.longitude : 0} latitude={hoverInfo ? hoverInfo.latitude : 0} closeButton={false}>
              {hoverInfo && 
                <div>
                  {hoverInfo.properties.budget && <p><b>Budget de la campagne : </b>{hoverInfo.properties.budget} €</p>}
                </div>
              }
            </Popup>
          </Source>
        </AppMap>
      )}
    </>
  );
}
