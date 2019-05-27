export const PATH_FR = {
  // OPERATEUR
  'operator.nom_commercial': {
    name: 'Opérateur',
  },
  operator_class: {
    name: 'Classe',
  },

  // AOM
  'aom.name': {
    name: 'AOM',
  },
  insee: {
    name: 'Insee',
  },
  insee_main: {
    name: 'Insee principal',
  },

  // PASSAGER
  'passenger.start.datetime': {
    name: 'Date départ',
  },
  'passenger.end.datetime': {
    name: 'Date arrivée',
  },
  'passenger.start.date': {
    name: 'Date départ',
  },
  'passenger.start.time': {
    name: 'Heure départ',
  },
  'passenger.start.day': {
    name: 'Jour',
  },
  'passenger.start.insee': {
    name: 'Insee de départ',
  },
  'passenger.end.insee': {
    name: "Insee à l'arrivée",
  },
  'passenger.start.town': {
    name: 'Commune de départ',
  },
  'passenger.end.town': {
    name: "Commune d'arrivée",
  },
  'passenger.start.lat': {
    name: 'Latitude de départ',
  },
  'passenger.end.lat': {
    name: "Latitude à l'arrivée",
  },
  'passenger.start.lng': {
    name: 'Longitude de départ',
  },
  'passenger.end.lng': {
    name: "Longitude à l'arrivée",
  },
  'passenger.duration': {
    name: 'Durée',
  },
  'passenger.distance': {
    name: 'Distance ( km )',
  },
  'passenger.seats': {
    name: 'Nombre de places réservées',
  },

  // ADRESSE
  'address.street': {
    name: 'Adresse',
  },
  'address.postcode': {
    name: 'Code postale',
  },
  'address.city': {
    name: 'Ville',
  },
  'address.country': {
    name: 'Pays',
  },

  // JOURNEY
  'validation.rank': {
    name: 'Classe',
  },
  'start.lat': {
    name: 'Latitude au départ',
  },
  'start.lng': {
    name: 'Longitude au départ',
  },
  'start.insee': {
    name: 'Insee départ',
  },
  'start.datetime': {
    name: 'Date départ',
  },
  'end.lat': {
    name: 'Latitude à arrivée',
  },
  'end.lng': {
    name: 'Longitude à arrivée',
  },
  'end.datetime': {
    name: 'Date arrivée',
  },
  'end.insee': {
    name: 'Insee arrivée',
  },
  journey_id: {
    name: 'Id du trajet',
  },
  is_driver: {
    name: 'Occupant.e du véhicule',
    values: {
      true: 'Conducteur',
      false: 'Passager',
    },
  },
  over_18: {
    name: 'Age',
    values: {
      true: 'Majeur',
      false: 'Mineur',
      yes: 'Majeur',
      no: 'Mineur',
      unknown: "Pas d'info.",
    },
  },
  traveler_hash: {
    name: 'Id',
  },
  passengers_count: {
    name: 'Nombre de passagers',
  },
  createdAt: {
    name: 'Date de création',
  },
  name: {
    name: 'Nom',
  },
  _id: {
    name: 'Id',
  },
  firstname: {
    name: 'Prénom',
  },
  lastname: {
    name: 'Nom',
  },
  phone: {
    name: 'N° de téléphone',
  },
  group: {
    name: 'Groupe',
  },
  role: {
    name: 'Rôle',
  },
  permissions: {
    name: 'Permissions',
  },
  email: {
    name: 'Email',
  },
  cost: {
    name: 'Coût',
  },
  duration: {
    name: 'Durée',
  },
  distance: {
    name: 'Distance',
  },
  chevron: {
    name: ' ',
  },

  // CONTACT

  'contact.phone': {
    name: 'N° de téléphone',
  },
  'contact.email': {
    name: 'Email',
  },

  // COMPANY
  nom_commercial: {
    name: 'Nom commercial',
  },
  raison_sociale: {
    name: 'Raison sociale',
  },
  'company.siren': {
    name: 'Numéro de Siren',
  },
  'company.naf_etablissement': {
    name: "Naf de l'établissement",
  },
  'company.naf_entreprise': {
    name: "Naf de l'entreprise",
  },
  'company.nature_juridique': {
    name: 'Nature juridique',
  },
  'company.cle_nic': {
    name: 'Cle NIC',
  },
  'company.rna': {
    name: 'RNA',
  },
  'company.vat_intra': {
    name: 'Vat intra.',
  },

  // BANK
  'bank.bank_name': {
    name: 'Nom de la banque',
  },

  'bank.client_name': {
    name: 'Nom du client',
  },

  'bank.iban': {
    name: 'Iban',
  },

  'bank.bic': {
    name: 'BIC',
  },

  // POLICIES
  status: {
    name: 'Statut',
    values: {
      active: 'actif',
      draft: 'brouillon',
    },
  },

  // CAMPAIGNS
  start: {
    name: 'Début',
  },
  end: {
    name: 'Fin',
  },
};
