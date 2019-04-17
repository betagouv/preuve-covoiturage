const _ = require('lodash');

module.exports = [
  {
    varname: 'conducteur',
    label: 'Conducteur',
    helper: 'Vaut 1 si le participant est conducteur, 0 sinon',
    internal: true,
    getter: tripStakeholder => tripStakeholder.is_driver,
  },
  {
    varname: 'majeur',
    label: 'Majeur',
    helper: 'Vaut 1 si le participant est majeur, 0 sinon',
    internal: true,
    getter: tripStakeholder => tripStakeholder.identity.over_18,
  },
  {
    varname: 'duree',
    label: 'Durée',
    helper: 'Durée exprimée en minutes',
    internal: true,
    getter: tripStakeholder => tripStakeholder.duration,
  },
  {
    varname: 'distance',
    label: 'Distance parcourue',
    helper: 'Distance parcourue exprimée en kilomètre',
    internal: true,
    getter: tripStakeholder => tripStakeholder.distance,
  },
  {
    varname: 'depart_sur_territoire',
    label: 'Départ du trajet sur le territoire',
    helper: 'Vaut 1 si le trajet démarre sur le territoire de l\'AOM',
    internal: true,
    getter: (tripStakeholder, { policy }) => _.get(tripStakeholder, 'start.aom._id') === policy.aom,
  },
  {
    varname: 'arrivee_sur_territoire',
    label: 'Arrivée du trajet sur le territoire',
    helper: 'Vaut 1 si le trajet arrive sur le territoire de l\'AOM',
    internal: true,
    getter: (tripStakeholder, { policy }) => _.get(tripStakeholder, 'end.aom._id') === policy.aom,
  },
  {
    varname: 'classe_de_preuve',
    label: 'Classe de preuve',
    helper: 'Classe de preuve au format numérique (A=1, B=2, C=3, ...)',
    internal: true,
    getter: (tripStakeholder) => {
      switch (tripStakeholder.class) {
        case 'A':
          return 1;
        case 'B':
          return 2;
        case 'C':
          return 3;
        default:
          return 0;
      }
    },
  },
  {
    varname: 'nombre_de_passager',
    label: 'Nombre de passager',
    helper: 'Nombre de passager dans le véhicule',
    internal: true,
    getter: (tripStakeholder, { trip }) => trip.people.length - 1,
  },
  {
    varname: 'nombre_de_siege',
    label: 'Nombre de siège',
    helper: 'Nombre de siège réservé par le participant',
    internal: true,
    getter: tripStakeholder => tripStakeholder.seats,
  },
  {
    varname: 'parKM',
    label: 'Montant fixe par km parcouru',
    helper: 'Vous pouvez indiquer ici une valeur fixe utilisable dans la formule',
    internal: false,
  },
];
