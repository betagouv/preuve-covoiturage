import { Config } from "@/config";
import { useApi } from "@/hooks/useApi";
import { SearchParamsInterface } from "@/interfaces/observatoire/componentsInterfaces";
import { BestTerritoriesDataInterface } from "@/interfaces/observatoire/dataInterfaces";
import { fr } from "@codegouvfr/react-dsfr";
import { Table as TableStyled} from "@codegouvfr/react-dsfr/Table";
import styled from '@emotion/styled';
import { css } from "@emotion/react";

const Table = styled(TableStyled)(
  css`
  & th {
    text-align: center;
    line-height: 1rem;
    padding: .5rem;
  }
  & td {
    text-align: center;
    line-height: 1rem;
    padding: .5rem;
  }
`);

export default function BestTerritoriesTable({ title, limit, params }: { title: string, limit: number, params: SearchParamsInterface }) {
  const apiUrl = Config.get<string>('next.public_api_url', '');
  const url = `${apiUrl}/best-monthly-territories?code=${params.code}&type=${params.type}&observe=${params.observe}&year=${params.year}&month=${params.month}&limit=${limit}`;
  const { data, error, loading } = useApi<BestTerritoriesDataInterface[]>(url);
  const dataTable = data ? data.map(d => [d.l_territory, d.journeys]) : []

  return (
    <>
      {loading && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>Chargement en cours...</div>
        </div>
      )}
      {error && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <div>{`Un problème est survenu au chargement des données: ${error}`}</div>
        </div>
      )}
      {!loading && !error && (
        <div className={fr.cx('fr-callout')}>
          <h3 className={fr.cx('fr-callout__title')}>{title}</h3>
          <Table data={dataTable} headers={['Nom','Nombre']} bordered fixed colorVariant={'blue-ecume'} />
        </div>
      )}
    </>
  );
}