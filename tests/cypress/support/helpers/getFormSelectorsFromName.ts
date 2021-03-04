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
        'boutton connexion',
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
          selector: 'mat-select[formcontrolname="group"]',
          type: 'mat-select',
        },
      ],
      [
        "droits d'accès",
        {
          selector: 'mat-select[formcontrolname="role"]',
          type: 'mat-select',
        },
      ],
      [
        'territoire',
        {
          selector: 'app-territory-autocomplete',
          type: 'mat-autocomplete',
        },
      ],
      [
        'opérateur',
        {
          selector: 'app-operator-autocomplete',
          type: 'mat-autocomplete',
        },
      ],
    ]),
  ],
]);

export function getFormSelectorsFromName(name: string, inputName?: string): FormSelectorMap {
  return formSelectors.get(name);
}
