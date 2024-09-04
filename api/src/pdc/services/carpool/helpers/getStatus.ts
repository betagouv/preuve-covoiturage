export function getStatus(
  created: Date,
  dates: Date[],
  maxDiff: number,
): string {
  // safe date casting
  const createdDate = created.getTime
    ? created.getTime()
    : new Date(created).getTime();
  return dates
      .map(
        (d) =>
          // safe date casting for date array
          createdDate - (d.getTime ? d.getTime() : new Date(d).getTime()),
      )
      .map((diff) => diff < maxDiff)
      .reduce((partStatus, status) => partStatus && status, true)
    ? "ok"
    : "expired";
}
