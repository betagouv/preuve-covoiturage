type FormSelector = { selector: string; type: string };
type FormSelectorMap = Map<string, FormSelector>;

export const formSelectors = new Map<string, FormSelectorMap>([
  [
    'le formulaire de connexion',
    new Map<string, FormSelector>([
      [
        'email',
        {
          selector: '.Login input[formcontrolname="email"]',
          type: 'input',
        },
      ],
      [
        'mot de passe',
        {
          selector: '.Login input[formcontrolname="password"]',
          type: 'input',
        },
      ],
      [
        'bouton connexion',
        {
          selector: '.Login button[type="submit"]',
          type: 'button',
        },
      ],
    ]),
  ],
  [
    'le formulaire de création utilisateur',
    new Map<string, FormSelector>([
      [
        'prénom',
        {
          selector: 'input[formcontrolname="firstname"]',
          type: 'input',
        },
      ],
      [
        'nom',
        {
          selector: 'input[formcontrolname="lastname"]',
          type: 'input',
        },
      ],
      [
        'email',
        {
          selector: 'input[formcontrolname="email"]',
          type: 'input',
        },
      ],
      [
        'numéro de téléphone',
        {
          selector: 'input[formcontrolname="phone"]',
          type: 'input',
        },
      ],
      [
        'groupe',
        {
          selector: 'mat-radio-group[formcontrolname="group"]',
          type: 'mat-radio',
        },
      ],
      [
        "droits d'accès",
        {
          selector: 'mat-radio-group[formcontrolname="role"]',
          type: 'mat-radio',
        },
      ],
      [
        'territoire',
        {
          selector: 'app-autocomplete',
          type: 'mat-autocomplete',
        },
      ],
      [
        'opérateur',
        {
          selector: 'app-autocomplete',
          type: 'mat-autocomplete',
        },
      ],
    ]),
  ],
  [
    'le champ email',
    new Map<string, FormSelector>([
      [
        'email',
        {
          selector: '[data-test="field-email"]',
          type: 'input',
        },
      ],
    ]),
  ],
  [
    "le formulaire de confirmation de l'adresse email",
    new Map<string, FormSelector>([
      [
        'mot de passe',
        {
          selector: '[data-test="field-password"]',
          type: 'input',
        },
      ],
      [
        'confirmation du mot de passe',
        {
          selector: '[data-test="field-confirm-password"]',
          type: 'input',
        },
      ],
    ]),
  ],
  [
    'le formulaire de changement de mot de passe',
    new Map<string, FormSelector>([
      [
        'ancien mot de passe',
        {
          selector: '[data-test="old-password"]',
          type: 'input',
        },
      ],
      [
        'nouveau mot de passe',
        {
          selector: '[data-test="new-password"]',
          type: 'input',
        },
      ],
      [
        'confirmation du mot de passe',
        {
          selector: '[data-test="new-password-confirm"]',
          type: 'input',
        },
      ],
    ]),
  ],
]);

export function getFormSelectorsFromName(name: string, inputName?: string): FormSelectorMap {
  return formSelectors.get(name);
}
