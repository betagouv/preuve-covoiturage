import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { createFilterOptions } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';



export default function SelectTerritory() {
  const searchParams = useSearchParams();
  const { dashboard } =useContext(DashboardContext)
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const territoryUrl = `${apiUrl}/territories?year=${dashboard.params.year}`;
  const { data, loading, error } = useApi<TerritoryListInterface[]>(territoryUrl);

  useEffect(()=>{
    const perim = async () => {
      if(searchParams.get('code') || searchParams.get('type') || searchParams.get('observe')){
        dashboard.getParams({
          code: searchParams.get('code') ? searchParams.get('code') as string : 'XXXXX',
          type: searchParams.get('type') ? searchParams.get('type') as PerimeterType : 'country',
          observe: searchParams.get('observe') ? searchParams.get('observe') as PerimeterType : 'com',
          name: data ? data.find(d => d.territory === dashboard.params.code && d.type === dashboard.params.type)?.l_territory as string : 'France'
        })
      }}
      perim()
    },[loading])
  return (
    <>
      {loading && (
        <div>Chargement en cours...</div>
      )}
      {error && (
        <div>{`Un problème est survenu au chargement des données: ${error}`}</div>
      )}
      {data && (
        <Autocomplete
          id='select-territory'
          options={data}
          value={data.find(d => d.territory === dashboard.params.code && d.type === dashboard.params.type)}
          getOptionLabel={(option) => `${option.l_territory} (${option.type})`}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.territory}>
                {option.l_territory} ({option.type})
              </li>
            )
          }}
          renderInput={(params) => <TextField {...params} label='Territoire' />}
          onChange={(e, v) => dashboard.onChangeTerritory(v as TerritoryListInterface)}
          filterOptions={createFilterOptions({
            matchFrom: 'any',
            limit: 100,
            ignoreCase: true,
            stringify: (option) => option.l_territory,
          })}
        />
      )}
    </>
  );
}
