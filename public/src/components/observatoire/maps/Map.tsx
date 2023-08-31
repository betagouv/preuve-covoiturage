'use client';
import Map, { MapRef, NavigationControl, FullscreenControl } from 'react-map-gl/maplibre';
import { MapInterface, ViewInterface } from '@/interfaces/observatoire/componentsInterfaces';
import 'maplibre-gl/dist/maplibre-gl.css';
import Legend from './Legend';
import { useCallback, useRef, useState, useEffect } from 'react';

const AppMap = (props: MapInterface) => {
  const mapRef = useRef<MapRef>(null);
  const defaultView: ViewInterface = {
    latitude: 46.9,
    longitude: 1.7,
    zoom: 5,
  };
  const fitBounds = () => {
    if (props.bounds) mapRef.current?.fitBounds(props.bounds, { padding: 20 }) ;
  };
  useEffect(() => {
    if (props.bounds) mapRef.current?.fitBounds(props.bounds, { padding: 20 }) ;
  }, [props.bounds]);
  
  const [cursor, setCursor] = useState<string>('');
  const defaultOnMouseEnter = useCallback(() => setCursor('pointer'), []);
  const defaultOnMouseLeave = useCallback(() => setCursor(''), []);
  
  return (
    <div className='fr-callout'>
      <h3 className='fr-callout__title'>{props.title}</h3>
      <Map
        ref={mapRef}
        initialViewState={props.initialView ? props.initialView : defaultView}
        style={{
          width: props.width ? props.width : '100%',
          height: props.height ? props.height : '60vh',
        }}
        mapStyle={props.mapStyle}
        onLoad={fitBounds}
        scrollZoom={props.scrollZoom}
        cursor={props.cursor ? props.cursor : cursor}
        onMouseEnter={props.onMouseEnter ? props.onMouseEnter : defaultOnMouseEnter}
        onMouseLeave={props.onMouseLeave ? props.onMouseLeave : defaultOnMouseLeave}
        interactiveLayerIds={props.interactiveLayerIds}
      >
        <NavigationControl />
        <FullscreenControl />
        {props.legend &&
          props.legend.map((l,i) =>
            <Legend key={i} title={l.title} type={l.type} classes={l.classes} order={l.order} />
          )
        }
        {props.children}
      </Map>
    </div>
  );
};

export default AppMap;
