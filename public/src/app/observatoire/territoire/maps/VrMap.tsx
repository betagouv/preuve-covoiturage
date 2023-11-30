import AppMap from '@/components/observatoire/maps/Map';
import { Config } from '@/config';
//import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import { LineLayer, Layer, Source } from 'react-map-gl/maplibre';
import { LngLatBoundsLike } from 'maplibre-gl';
import { cmsHost } from "@/helpers/cms";
import { useJson } from '@/hooks/useJson';
import { FeatureCollection } from 'geojson';
import { useMemo } from 'react';

export default function VrMap({ title}: { title: string }) {
  const mapTitle = title;
  const mapStyle = Config.get<string>('observatoire.mapStyle');
  const bounds = [-5.225, 41.333, 9.55, 51.2] as LngLatBoundsLike;
  const url = `${cmsHost}/assets/897ba3a7-847e-4522-aead-7d8dd0db63c6`;
  const { data } = useJson<FeatureCollection>(url);
  const geojson = useMemo(()=>{
    return data ? data : ''
  }, [data]);
  const layer: LineLayer = {
    id: 'vr',
    source:'vr',
    type: 'line',
    paint: {
      'line-width': 10,  
      'line-color': '#000091',
      'line-opacity': 0.8
    },
  };

  return (
    <>
      <AppMap 
        title={mapTitle} 
        mapStyle={mapStyle} 
        bounds={bounds} 
        scrollZoom={false} 
        interactiveLayerIds={['vr']}
      >
        <Source id='vr' type='geojson' data={geojson}>
          <Layer {...layer} />
        </Source>
      </AppMap>
    </>
  );

}