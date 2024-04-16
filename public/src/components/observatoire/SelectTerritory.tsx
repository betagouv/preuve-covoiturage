'use client'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { fetchSearchAPI } from '@/helpers/search';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';
import Badge from '@codegouvfr/react-dsfr/Badge';

export default function SelectTerritory() {
  const { dashboard } =useContext(DashboardContext)
  const router = useRouter();
  const defaultOption = {
    territory: dashboard.params.code,
    l_territory: dashboard.params.name,
    type: dashboard.params.type
  }
  const [options, setOptions] = useState<any[]>([defaultOption]);
  const search =  async (v: string | null) => {
    const query = {
      q:v,
      attributesToSearchOn:['territory','l_territory'], 
      limit:20
    };
    const response = await fetchSearchAPI('indexes/geo/search',{method:'post',body: JSON.stringify(query)});
    setOptions(response.hits);
  };

  const getUrl = (option?:TerritoryListInterface) => {
    return `/observatoire/territoire${option ? `?code=${option.territory}&type=${option.type}` : ''}`
  }
  

  return ( 
    <>
    <Autocomplete
      id='select-territory'
      options={options}
      getOptionLabel={(option) => `${option.l_territory} (${option.type})`}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            <Badge severity="info" small>{option.type}</Badge>
            {option.l_territory} ({option.territory})            
          </li>
        )
      }}
      noOptionsText={'Pas de résultats'}
      renderInput={(params) => <TextField {...params} label='Chercher mon territoire' />}
      onInputChange={async(e, v) => {
        await search(v);
      }}
      
      onChange={(e,v) =>{
        router.push(getUrl(v!))
        }
      }
    />
    </>
  );
}
