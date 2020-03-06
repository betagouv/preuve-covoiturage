import { WeekDay } from '@angular/common';

// norme ecmascript
export const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export function dayLabelCapitalized(day: WeekDay): string {
  return DAYS[day].charAt(0).toUpperCase() + DAYS[day].slice(1);
}
