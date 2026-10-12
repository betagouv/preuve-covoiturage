import dayjs, { type Dayjs } from "dayjs";

// Les bornes des calendriers ne s'appliquent pas à la saisie clavier : on revalide avant l'envoi.
export const exportRangeError = (startDate: Dayjs, endDate: Dayjs, now: Dayjs = dayjs()): string | undefined => {
  const minStart = now.subtract(2, "years").startOf("day");
  const maxEnd = now.subtract(5, "days").endOf("day");
  if (endDate.isBefore(startDate, "day")) return "La date de fin doit être postérieure à la date de début.";
  if (endDate.isAfter(maxEnd)) return "La date de fin doit être antérieure d'au moins 5 jours à aujourd'hui.";
  if (startDate.isBefore(minStart)) return "La date de début ne peut pas remonter à plus de 2 ans.";
  return undefined;
};
