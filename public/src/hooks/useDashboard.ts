'use client'
import { Config } from '@/config';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'
import { AutocompleteChangeReason } from '@mui/material';

export const useDashboard = () => {
  const searchParams = useSearchParams()
  const [params, setParams] = useState({
    code: searchParams.get('code') ? searchParams.get('code') as string : 'XXXXX' ,
    name: 'France',
    type: searchParams.get('type') ? searchParams.get('type') as PerimeterType : 'country',
    observe: searchParams.get('observe') ? searchParams.get('observe') as PerimeterType : 'com',
    year: searchParams.get('year') ? Number(searchParams.get('year')) : new Date().getFullYear(),
    month: searchParams.get('month') ? Number(searchParams.get('month')) : new Date().getMonth(),
    map: searchParams.get('map') ? Number(searchParams.get('map')) : 1,
    graph: searchParams.get('graph') ? Number(searchParams.get('graph')) : 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = Config.get('next.public_api_url', '');
  const url = `${apiUrl}/monthly-flux/last`;
  const onChangeTerritory = useCallback((value: TerritoryListInterface | null, reason:AutocompleteChangeReason) => {
    setParams( p =>{
      const params = (reason === 'clear' || !value) ? {code: 'XXXXX', name: 'France', type: 'country'} : {code: value.territory, name: value.l_territory, type: value.type}
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
  return { params, error, loading, onChangeTerritory, onChangePeriod, onChangeObserve, onChangeGraph, onChangeMap };
};

