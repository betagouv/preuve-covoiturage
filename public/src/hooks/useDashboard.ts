import { Config } from '@/config';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { SearchParamsInterface } from '@/interfaces/observatoire/componentsInterfaces';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useState, useEffect, useCallback } from 'react';

export const useDashboard = (props: SearchParamsInterface) => {
  const [params, setParams] = useState({
    code: props.code ? props.code : 'XXXXX',
    name: 'France',
    type: props.type ? props.type : 'country',
    observe: props.observe ? props.observe : 'com',
    year: props.year ? props.year : new Date().getFullYear(),
    month: props.month ? props.month : new Date().getMonth(),
    map: props.map ? props.map : 1,
    graph: props.graph ? props.graph : 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = Config.get('next.public_api_url', '');
  const url = `${apiUrl}/monthly-flux/last`;
  const onChangeTerritory = useCallback((value: TerritoryListInterface) => {
    setParams( p =>{
      return{ ...p, code: value.territory, name: value.l_territory, type: value.type, observe:'com' }
    });
  },[]);
  const onChangePeriod = useCallback((value: { year: number; month: number }) => {
    setParams( p =>{
      return { ...p, year: value.year, month: value.month }
    });
  },[]);
  const onChangeObserve = useCallback((value: PerimeterType) => {
    setParams( p =>{
      return { ...p, observe: value }
    });
  },[]);
  const onChangeGraph = useCallback((value: number) => {
    setParams( p =>{
      return{ ...p, graph: value }
    });
  },[]);
  const onChangeMap = useCallback((value: number) => {
    setParams( p =>{
      return{ ...p, map: value }
    });
  },[]);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(url);
      const res = await response.json();
      if (response.ok) {
        onChangePeriod({ year: res.result.data.year, month: res.result.data.month });
        setError(null);
      } else {
        setError(res.error.data);
      }
      setLoading(false);
    };
    fetchData();
  }, [onChangePeriod,url]);
  return { params, error, loading, onChangeTerritory, onChangePeriod, onChangeObserve, onChangeGraph, onChangeMap };
};

