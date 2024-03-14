'use client'
import { Config } from '@/config';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useState, useEffect, useCallback } from 'react';
import { Params } from '../interfaces/common/contextInterface';

export const useDashboard = () => {
  const [params, setParams] = useState({
    code: 'XXXXX' ,
    name: 'France',
    type: 'country' as PerimeterType,
    observe: 'com' as PerimeterType,
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    map: 1,
    graph: 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = Config.get('next.public_api_url', '');
  const url = `${apiUrl}/monthly-flux/last`;

  
  const getParams = useCallback((params:Params) => {
    setParams( p =>{
      return { ...p, ...params }
    })
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
  return { params, error, loading, getParams, onChangeTerritory, onChangePeriod, onChangeObserve, onChangeGraph, onChangeMap };
};

