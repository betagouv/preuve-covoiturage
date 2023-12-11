import { monthList, yearList } from '@/helpers/lists';
import SelectInList from '../common/SelectInList';

type SelectPeriodProps = {
  year: number;
  month: number;
  onChange: (v: { year: number, month: number }) => void;
};

export default function SelectPeriod(props: SelectPeriodProps) {
  const handlerChangeYear = (value: number) => {
    const period = { year: value, month: props.month };
    props.onChange(period);
  };
  const handlerChangeMonth = (value: number) => {
    const period = { year: props.year, month: value };
    props.onChange(period);
  };

  return (
    <>
      <SelectInList
        labelId='mois'
        label='Mois'
        id={props.month}
        list={monthList}
        sx={{ minWidth: 120 }}
        onChange={handlerChangeMonth}
      />
      <SelectInList
        labelId='annee'
        label='Année'
        id={props.year}
        list={yearList}
        sx={{ ml: 3, minWidth: 120 }}
        onChange={handlerChangeYear}
      />
    </>
  );
}
