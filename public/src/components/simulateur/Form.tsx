"use client"
import { fr } from '@codegouvfr/react-dsfr';
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Tag from '@codegouvfr/react-dsfr/Tag';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { castPerimeterType, fetchSearchAPI } from '../../helpers/search';
import { PerimeterType } from '../../interfaces/observatoire/Perimeter';


export default function FormSimulateur() {
  const [form, setForm] = useState({
    name: '',
    firstname: '',
    job: '',
    email: '',
    territory_name: '',
    simulation: {
      territory_insee: '',
      policy_template_id: '1'
    }
  });
  const defaultOption = {
    territory: '',
    l_territory: '',
    type: 'com' as PerimeterType
  };
  const [options, setOptions] = useState([defaultOption]);
  const search =  async (v: string | null) => {
    const query = {
      q:v,
      attributesToSearchOn:['territory','l_territory'], 
      limit:20
    };
    const response = await fetchSearchAPI('indexes/geo/search',{method:'post',body: JSON.stringify(query)});
    setOptions(response.hits);
  };
  return (
    <>
      <RadioButtons
        legend="1 - Sélectionner le scénario de campagne d'incitation privilégié pour votre territoire"
        name="radio"
        options={[
          {
            label: 'AOM',
            hintText:<>
              <ul>
                <li><b>Trajets éligibles :</b>
                  <ul>
                    <li>trajets avec Origine <b>OU</b> Destination sur le territoire</li>
                    <li>trajets de plus de 5km</li>
                    <li>mono opérateur majoritaire</li>
                    <li>classe C</li>
                    <li>6 trajets max/j pour le conducteur</li>
                    <li>2 trajets max/j pour le passager</li>       
                  </ul>
                </li>
                <li><b>Incitation :</b>
                  <ul>
                    <li>versée au conducteur</li>
                    <li>De 5 à 15 km : 1,5 euros par trajet</li>
                    <li>À partir de 15 km : 0.1 euro par trajet par km</li>
                    <li>Au delà de 30 km : 3 euros par trajet</li>     
                  </ul>
                </li>
              </ul>
            </>,
            nativeInputProps: {
              checked: form.simulation.policy_template_id === "1",
              onChange: ()=> setForm( (v) => ({
                ...v,
                simulation: {
                  ...v.simulation,
                  policy_template_id: '1'
                }
              }))
            }
          },
          {
            label: 'Région ou Grande AOM',
            hintText:<>
              <ul>
                <li><b>Trajets éligibles :</b>
                  <ul>
                    <li>trajets avec Origine <b>ET</b> Destination sur le territoire</li>
                    <li>trajets de plus de 5km</li>
                    <li>multi opérateurs</li>
                    <li>classe C</li>
                    <li>6 trajets max/j pour le conducteur</li>
                    <li>2 trajets max/j pour le passager</li>       
                  </ul>
                </li>
                <li><b>Incitation :</b>
                  <ul>
                    <li>versée au conducteur</li>
                    <li>De 5 à 15 km : 1,5 euros par trajet</li>
                    <li>À partir de 15 km : 0.1 euro par trajet par km</li>
                    <li>Au delà de 30 km : 3 euros par trajet</li>     
                  </ul>
                </li>
              </ul>
            </>,
            nativeInputProps: {
              checked: form.simulation.policy_template_id === "2",
              onChange: ()=> setForm( (v) => ({
                ...v,
                simulation: {
                  ...v.simulation,
                  policy_template_id: '2'
                }
              }))
            }
          },
        ]}
        orientation="horizontal"
      />
      <Autocomplete
        id='select-territory'
        options={options}
        getOptionLabel={(option) => `${option.l_territory} - ${castPerimeterType(option.type)}`}
        groupBy={(option) => option.type}
        renderGroup={(params) => (
          <li key={params.key}>
            <div className={fr.cx('fr-tag','fr-ml-3v')}>{castPerimeterType(params.group as PerimeterType)}</div>
            {params.children}
          </li>
        )}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.territory}>
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
        onInputChange={async(e, v) => {
          await search(v);
        }}
        
        onChange={(e,v) =>{
          
          }
        }
      />
    </>
  );
}
  