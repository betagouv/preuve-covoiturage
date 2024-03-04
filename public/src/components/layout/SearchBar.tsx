'use client'
import Autocomplete from "@mui/material/Autocomplete";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { fetchSearchAPI } from '@/helpers/search';
import { useState } from 'react';

type SearchBarProps = {
  className?: string;
  id: string;
  placeholder: string;
  type: "search";
};

export default function SearchBar(props: SearchBarProps) {
  const { className, id, placeholder, type } = props;
  const [options, setOptions] = useState([]);
  const search =  async (v: string | null) => {
    const query = {
      queries: [
        {q:v, indexUid:"article",attributesToRetrieve:["title","slug","content","createdAt"],limit:50},
        {q:v, indexUid:"resource",attributesToRetrieve:["title","slug","content","createdAt"],limit:50},
        {q:v, indexUid:"page",attributesToRetrieve:["title","slug","content","createdAt"],limit:50}
      ]
    };
    const response = await fetchSearchAPI('multi-search',{method:'post',body: JSON.stringify(query)})
   setOptions(response.results.map((r:any) => r.hits.map( (h:any) => {
      return {
        id: r.indexUid,
        ...h,
      }
    })).flat());
  };

  return (
    <Autocomplete 
      id='search'
      options= {options}
      //value={null}
      getOptionLabel={(option) => `${option.title} (${option.id})`}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.slug}>
            {option.title} ({option.id})
          </li>
        )
      }}
      onInputChange={async(e, v) => {
        await search(v);
      }}
      renderInput={params => 
          <div ref={params.InputProps.ref}>
              <input 
                  {...params.inputProps} 
                  className={cx(params.inputProps.className, className)}
                  id={id}
                  placeholder={placeholder}
                  type={type}
              />
          </div>
      }
    />
);
}