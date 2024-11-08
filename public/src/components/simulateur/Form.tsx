"use client"
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Tag from '@codegouvfr/react-dsfr/Tag';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { Config } from '../../config';
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
  const isFormValid = () => {
    return form.email !== "" && 
    form.name !== "" && 
    form.firstname !== "" && 
    form.job !== "" &&
    form.simulation.territory_insee !== ""
  }
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
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submit = async (path:string, options = {}) => {
    try {
      // Build request URL
      const hostUrl = Config.get<string>('simulator.host', 'http://localhost:4200');
      const requestUrl = `${hostUrl}/${path}`;
      const response = await fetch(requestUrl, options);
      const data = await response.json();
      return data;
    }
    catch(e){
      console.error(e);
      throw new Error(`Please check if your server is running and you set all the required tokens.`);
    }
  }

  return (
    <div className={fr.cx('fr-container')}>
      <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-grid-row--center')}>
        <div className={fr.cx('fr-col-12')}>
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
        </div>
        <div className={fr.cx('fr-col-4')}>
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
            
            onChange={(e, v) => {setForm( (f) => ({
              ...f,
              territory_name: v!.l_territory,
              simulation: {
                ...f.simulation,
                territory_insee: v!.territory
              }
            }))}
            }
          />
          <Input
            label="Nom"
            nativeInputProps={{
              onChange: (e) => {setForm( (f) => ({
                ...f,
                name: e.target.value
              }))}
            }}
          />
          <Input
            label="Prénom"
            nativeInputProps={{
              onChange: (e) => {setForm( (f) => ({
                ...f,
                firstname: e.target.value
              }))}
            }}
          />
          <Input
            label="Poste"
            nativeInputProps={{
              onChange: (e) => {setForm( (f) => ({
                ...f,
                job: e.target.value
              }))}
            }}
          />
          <Input
            label="E-mail"
            nativeInputProps={{
              onChange: (e) => {setForm( (f) => ({
                ...f,
                email: isValidEmail(e.target.value.toLocaleLowerCase().trim()) ? e.target.value.toLocaleLowerCase().trim() : ''
              }))}
            }}
          />
          <Button onClick={() => submit('policy/simulate',{method:'post',data: form, headers: Config.get('simulator.headers')})}
            disabled={!isFormValid()}
          >
            Recevoir la simulation
          </Button>
          <div>Le récapitulatif vous sera transmis directement par email.
          Vérifiez vos filtres et vos courriers indésirables si vous ne le recevez pas rapidement.</div>
        </div>
      </div>
    </div>
  );
}
  