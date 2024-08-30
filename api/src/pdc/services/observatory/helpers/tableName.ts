type Params = {
  month?: number;
  trimester?: number;
  semester?: number;
};
export const getTableName = (
  params: Params,
  schemaName: string,
  tableName: string,
) => {
  const table = `${schemaName}.${tableName}`;
  if (params.month !== undefined) {
    return table.concat("_by_month");
  }
  if (params.trimester !== undefined) {
    return table.concat("_by_trimester");
  }
  if (params.semester !== undefined) {
    return table.concat("_by_semester");
  }
  return table.concat("_by_year");
};
