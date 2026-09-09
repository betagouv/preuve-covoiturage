'use client'
import { searchTerritories, TerritorySearchResult } from '@/helpers/api';
import { debounce } from '@/helpers/debounce';
import { targetMillesime } from '@/helpers/lists';
import { castPerimeterType, getUrl } from '@/helpers/search';
import { fr } from '@codegouvfr/react-dsfr';
import Tag from '@codegouvfr/react-dsfr/Tag';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useDashboardContext } from '../../context/DashboardProvider';

export default function SelectTerritory(props: { url:string }) {
  const { dashboard } = useDashboardContext();
  const router = useRouter();
  const defaultOption: TerritorySearchResult = {
    id: `${dashboard.params.code}_${dashboard.params.type}`,
    territory: dashboard.params.code,
    l_territory: dashboard.params.name,
    type: dashboard.params.type,
    year: dashboard.params.year
  }
  const [options, setOptions] = useState<TerritorySearchResult[]>([defaultOption]);
  const { year } = dashboard.params;
  const search = useMemo(
    () =>
      debounce((v: string | null) => {
        void searchTerritories(v, 20, targetMillesime(year)).then(setOptions);
      }),
    [year],
  );

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
      filterOptions={(options) => options}
      onInputChange={(e, v, reason) => {
        // `reset` = libellé réinjecté après sélection, pas une saisie : ne pas rechercher.
        if (reason === 'input') search(v);
      }}
      
      onChange={(e,v) =>{
        router.push(getUrl(props.url, v!))
        }
      }
    />
    </>
  );
}
