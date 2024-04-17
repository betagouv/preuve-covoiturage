'use client'
import { Config } from '@/config';
import { INSEECode, PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useState, useCallback } from 'react';
import { Params } from '../interfaces/common/contextInterface';
import { fetchSearchAPI } from '../helpers/search';

export const useDashboard = () => {
  const [params, setParams] = useState({
    code: 'XXXXX',
    name: 'France',
    type: 'country'as PerimeterType,
    observe: 'com' as PerimeterType,
    year: new Date().getFullYear(),
    month: 1,
    map: 1,
    graph: 1,
  });
  const [lastPeriod, setLastPeriod] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = Config.get('next.public_api_url', '');
  const url = `${apiUrl}/monthly-flux/last`;
  
  const getParams = useCallback((params:Params) => {
    setParams( p =>{
      return { ...p, ...params }
    })
  },[]);

  const onLoadTerritory = useCallback( async (value?: {code: INSEECode, type: PerimeterType}) => {
    const params = value ? value : {code: 'XXXXX', type: 'country' as PerimeterType};
    const name = await getName(params);
    setParams( p =>{
      return { ...p, ...params, name: name, observe:'com' } as typeof p
    });
    await getLastPeriod(); 
  },[]); 
  
  const onChangeTerritory = useCallback((value: TerritoryListInterface) => {
    setParams( p =>{
        const params = {code: 'XXXXX', name: 'France', type: 'country'}
        if (value) {
           params.code = value.territory
           params.name = value.l_territory
           params.type = value.type
        } 
      return { ...p, ...params, observe:'com' } as typeof p
    }) 
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

  const getLastPeriod = async () => {
    const response = await fetch(url);
    const res = await response.json();
    if (response.ok) {
      onChangePeriod({ year: res.result.data.year, month: res.result.data.month });
      setLastPeriod(new Date(res.result.data.year, res.result.data.month-1).getTime());
      setError(null);
    } else {
      setError(res.error.data);
    }
    setLoading(false);
  };
  
  const getName = async (value: {code: INSEECode, type: PerimeterType}) => {
    const query = {
      q:`${value.code}_${value.type}`,
      attributesToSearchOn:['id'], 
      limit:1
    };
    const response = await fetchSearchAPI('indexes/geo/search',{method:'post',body: JSON.stringify(query)});
    return response ? response.hits[0].l_territory as string : 'France';
  };
  
  return { params, lastPeriod, error, loading, getParams, onLoadTerritory, onChangeTerritory,getName, onChangePeriod, getLastPeriod, onChangeObserve, onChangeGraph, onChangeMap };
};

