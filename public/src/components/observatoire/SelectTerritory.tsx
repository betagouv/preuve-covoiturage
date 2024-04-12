'use client'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { createFilterOptions } from '@mui/material';
import { fetchSearchAPI } from '@/helpers/search';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';
import { PerimeterType } from '@/interfaces/observatoire/Perimeter';

type TerritorySearchOptions = {
  territory: string,
  l_territory:string,
  type: string,
};

export default function SelectTerritory() {
  const searchParams = useSearchParams();
  const { dashboard } =useContext(DashboardContext)
  const router = useRouter();
  const defaultOption = {
    territory: dashboard.params.code,
    l_territory: dashboard.params.name,
    type: dashboard.params.type
  }
  const [options, setOptions] = useState<TerritorySearchOptions[]>([defaultOption]);
  const search =  async (v: string | null) => {
    const query = {
      queries: [
        {q:v, indexUid:"geo",attributesToRetrieve:["l_territory","territory","type"],limit:50},
      ]
    };
    const response = await fetchSearchAPI('multi-search',{method:'post',body: JSON.stringify(query)});
    setOptions(response.results.map((r:any) => r.hits.map( (h:any) => {
      // eslint-disable-next-line no-unused-vars
      const { tags,content, ...hit } = h;
      void content;
      void tags;
      return {
        id: r.indexUid,
        tag: h.tags ? h.tags[0].slug : null,
        ...hit,
      }
    })).flat());
  };

  const getUrl = (option?:TerritorySearchOptions) => {
    return `/observatoire/territoire${option ? `?code=${option.territory}&type=${option.type}` : ''}`
  }
  

  return (  
    <Autocomplete
      id='select-territory'
      options={options}
      noOptionsText={'Pas de résultats'}
      value={options[0]}
      getOptionLabel={(option) => `${option.l_territory} (${option.type})`}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.territory}>
            {option.l_territory} ({option.type})
          </li>
        )
      }}
      renderInput={(params) => <TextField {...params} label='Territoire' />}
      onInputChange={async(e, v) => {
        await search(v);
      }}
      onChange={(e,v) =>{
        router.push(getUrl(v!))
        }
      }
      filterOptions={createFilterOptions({
        matchFrom: 'any',
        limit: 100,
        ignoreCase: true,
        stringify: (option) => option.l_territory,
      })}
    />
  );
}
