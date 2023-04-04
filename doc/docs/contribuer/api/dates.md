# Gestion des dates

::: warning
S'il faut retenir une seule chose :  
Utiliser les helpers et non les libraries ou `new Date()` directement.
:::

## Contexte

L'objet `Date` de Javascript ne gère pas les fuseaux horaires (_timezone_). Dans certains cas, la conversion est faite automatiquement vers UTC, dans d'autres non. Pour éviter les erreurs et normaliser la gestion des dates quelque soit l'environnement, il est impératif d'utiliser les helpers mis à disposition dans l'appli.

> Les helpers sont disponibles dans `@pdc/service-policy` pour le moment et pourront être consolidés dans un provider / helper spécifique.

Les problèmes résolus par cette approche sont :

- Cohérence du comportement de création d'une date quelque soit la _timezone_ du serveur. (prod en UTC, dev en Europe/Paris)
- Définition d'un fuseau horaire par défaut pour l'application: `Europe/Paris`
- Addition / soustraction de jours, d'heures, de mois en respectant le bon fuseau
- Troncage de la date dans le bon fuseau (ex. début de journée)
- Formattage sécurisé des dates en ISO ou local
- Conversion d'une chaine de caractères en date avec prise en charge du fuseau

## Les helpers

```ts
import {
  addDaysTz,
  addMonthsTz,
  castUserStringToUTC,
  startOfMonthTz,
  subDaysTz,
  toISOString,
  toTzString,
} from './dates.helper';
```
_Liste non exhaustive_

## Principes d'utilisation dans l'application

L'application et sa base de données fonctionnent avec des dates en UTC exclusivement. Le monde extérieur à l'application fonctionne dans son fuseau horaire. La conversion est faite à la frontière entre les deux.

### Par typologie

- `Action`: reçoit TOUJOURS un objet `Date` converti en amont (par le schema). Les actions ne doivent pas assurer de conversion et les dates en paramètres ne doivent jamais être exprimées en `string`.
- `Commande`: reçoit une chaine de caractère, souvent incomplète (ex. `2023-01-01`) qui est convertie en objet `Date` dans le fuseau horaire de l'utilisateur (`Europe/Paris` par défaut). Le fuseau peut-être passé en argument si la commande le supporte.

### Exemple frontend <> backend

Dans l'interface web, une date est entrée par l'utilisateur et les résultats affichés contiennent aussi des dates.

1. L'utilisateur entre une date dans son fuseau horaire
2. Le frontend envoie la date complète avec son fuseau au backend (`2023-01-01T00:00:00+0100`)
3. Le backend convertit la chaine de caractères en `Date` (`new Date('2023-01-01T00:00:00+0100') -> 2022-12-31T23:00:00Z`)
4. L'objet `Date` est utilisé pour filtrer les résultats (`2022-12-31T23:00:00Z`)
5. Les résultats sont renvoyés avec des dates en UTC
6. Le frontend convertit les dates UTC en dates locales pour l'affichage

### Exemple export de données (xls / csv)

Quand le backend crée un fichier XLSX ou CSV envoyé directement à l'utilisateur, le _frontend_ est le fichier. Dans ce cas, il faut informer le backend du fuseau horaire à utiliser et le fuseau est alors passé à l'action via un paramètre `tz`. Le formattage dans le bon fuseau horaire est fait par le générateur de fichier.

## Modifier des dates

Les librairies utilisées par les helpers est `date-fns` et `date-fns-tz`. La première permet de modifier des dates en ajoutant ou enlevant des jours, des mois, etc. Ces calculs ne gèrent pas les fuseaux horaires et peuvent poser problème. Un autre soucis est le troncage de date. Il est utile d'avoir le début de journée ou de mois à partir d'une date mais il faut respecter le fuseau pour que ce soit juste.

Les helpers suivants permettent de retrouver ces fonctionnalités tout en étant sûr de conserver le fuseau horaire.

- `today(tz?: Timezone)` : date du jour à minuit
- `addDaysTz(d: Date, days: number, tz?: Timezone)` : ajouter des jours
- `subDaysTz(d: Date, days: number, tz?: Timezone)` : soustraire des jours
- `addMonthsTz(d: Date, months: number, tz?: Timezone)` : ajouter des mois
- `startOfMonthTz(d: Date, tz?: Timezone)` : début du mois en cours
