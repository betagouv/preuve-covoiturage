'use client'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { castPerimeterType, fetchSearchAPI } from '@/helpers/search';
import { TerritoryListInterface } from '@/interfaces/observatoire/dataInterfaces';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { fr } from '@codegouvfr/react-dsfr';

export default function SelectTerritory(props: { url:string }) {
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

  const getUrl = (url: string, option?:TerritoryListInterface) => {
    return `/observatoire/${url}${option ? `?code=${option.territory}&type=${option.type}` : ''}`
  }
  

  return ( 
    <>
    <Autocomplete
      id='select-territory'
      options={options}
      getOptionLabel={(option) => `${option.l_territory} - ${castPerimeterType(option.type)}`}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            <div>
              <div> <span className={fr.cx('fr-text--bold')}>{option.l_territory}</span> <span className={fr.cx('fr-text--xs')}>({option.territory})</span></div>
              <div>
                <Tag small>{castPerimeterType(option.type)}</Tag>
              </div>
              
            </div>
          </li>
        )
      }}
      noOptionsText={'Pas de résultats'}
      renderInput={(params) => <TextField {...params} label='Chercher mon territoire' />}
      onInputChange={async(e, v) => {
        await search(v);
      }}
      
      onChange={(e,v) =>{
        router.push(getUrl(props.url, v!))
        }
      }
    />
    </>
  );
}
