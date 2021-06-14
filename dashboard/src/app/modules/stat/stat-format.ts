const monthsLabel = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jui', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

// format yyyy-mm formated string to month label
export function formatMonthLabel(monthDate) {
  const monthDateSpl = monthDate.split('-');
  return `${monthsLabel[parseInt(monthDateSpl[1]) - 1]} ${monthDateSpl[0]}`;
}

// format iso string date to graph label
export function formatDayLabel(dayDate) {
  const date = new Date(dayDate);
  return `${date.getDate()} ${monthsLabel[date.getMonth()]}`;
}
