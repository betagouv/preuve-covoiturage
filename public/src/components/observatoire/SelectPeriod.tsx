import { monthList, yearList } from '@/helpers/lists';
import SelectInList from '../common/SelectInList';
import { useContext } from 'react';
import { DashboardContext } from '@/context/DashboardProvider';



export default function SelectPeriod() {
  const { dashboard } =useContext(DashboardContext);
  const handlerChangeYear = (value: number) => {
    const period = { year: value, month: dashboard.params.month };
    dashboard.onChangePeriod(period);
  };
  const handlerChangeMonth = (value: number) => {
    const period = { year: dashboard.params.year, month: value };
    dashboard.onChangePeriod(period);
  };

  return (
    <>
      <SelectInList
        labelId='mois'
        label='Mois'
        id={dashboard.params.month}
        list={monthList}
        sx={{ minWidth: 120 }}
        onChange={handlerChangeMonth}
      />
      <SelectInList
        labelId='annee'
        label='Année'
        id={dashboard.params.year}
        list={yearList}
        sx={{ ml: 3, minWidth: 120 }}
        onChange={handlerChangeYear}
      />
    </>
  );
}
