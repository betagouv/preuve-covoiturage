import AppMap from '@/components/observatoire/maps/Map';
import { Config } from '@/config';
import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import { LineLayer, Layer, Popup, Source } from 'react-map-gl/maplibre';
import { LngLatBoundsLike } from 'maplibre-gl';
import { cmsHost } from "@/helpers/cms";
import { useJson } from '@/hooks/useJson';
import { FeatureCollection } from 'geojson';

export default function VrMap({ title, params }: { title: string; params: SearchParamsInterface }) {
  const mapTitle = title;
  const mapStyle = Config.get<string>('observatoire.mapStyle');
  const bounds = [-5.225, 41.333, 9.55, 51.2] as LngLatBoundsLike;
  const url = `${cmsHost}/assets/897ba3a7-847e-4522-aead-7d8dd0db63c6?download`;
  const { data, error, loading } = useJson<FeatureCollection>(url);
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
        <Source id='vr' type='geojson' data={data}>
          <Layer {...layer} />

        </Source>
      </AppMap>
    </>
  );

}