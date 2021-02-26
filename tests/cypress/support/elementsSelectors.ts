export const elementsSelectors = new Map([
  ['le menu administration', 'button[mattooltip="Administration"]'],
  ['le menu utilisateurs', 'a[href="/admin/all-users"]'],
  ["le menu création d'un nouvel utilisateur", 'button[mattooltip="Ajouter un utilisateur"]'],
  ['le bouton créer un utilisateur', 'form.CreateEditUserForm button[type="submit"]'],
  ["l'écran liste des utilisateurs", 'div.Users-list'],
  ['la liste des utilisateurs', 'div.Users-list table tbody > tr'],
  ['le formulaire de création utilisateur', 'form.CreateEditUserForm'],
]);

type FormSelector = string | { selector: string; type: string };
type FormSelectorMap = Map<string, FormSelector>;

export const formInputsSelectors = new Map<string, FormSelectorMap>([
  [
    'le formulaire de connexion',
    new Map<string, FormSelector>([
      ['email', '.Login input[formcontrolname="email"]'],
      ['mot de passe', '.Login input[formcontrolname="password"]'],
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
      ['prénom', 'input[formcontrolname="firstname"]'],
      ['nom', 'input[formcontrolname="lastname"]'],
      ['email', 'input[formcontrolname="email"]'],
      ['numéro de téléphone', 'input[formcontrolname="phone"]'],
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
    ]),
  ],
]);
