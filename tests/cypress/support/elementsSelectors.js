const elementsSelectors = new Map([
    ['le menu administration', 'button[mattooltip="Administration"]'],
    ['le menu utilisateurs', 'a[href="/admin/all-users"]'],
    ["le menu création d'un nouvel utilisateur", 'button[mattooltip="Ajouter un utilisateur"]'],
    ['le bouton créer un utilisateur', 'form.CreateEditUserForm button[type="submit"]'],
    ["l'écran liste des utilisateurs", 'div.Users-list'],
    ['la liste des utilisateurs', 'div.Users-list table tbody > tr'],
    ['le formulaire de création utilisateur', 'form.CreateEditUserForm'],
]);

const formInputsSelectors = new Map([
  [
    'le formulaire de connexion',
    new Map([
      ['email','.Login input[formcontrolname="email"]'],
      ['mot de passe', '.Login input[formcontrolname="password"]'],
      ['boutton connexion', {
        selector: '.Login button[type="submit"]',
        type: 'button',
      }],
    ]),
  ],
  [
    'le formulaire de création utilisateur',
    new Map([
      ['prénom', 'input[formcontrolname="firstname"]'],
      ['nom', 'input[formcontrolname="lastname"]'],
      ['email', 'input[formcontrolname="email"]'],
      ['numéro de téléphone', 'input[formcontrolname="phone"]'],
      ['groupe', {
        selector: 'mat-select[formcontrolname="group"]',
        type: 'mat-select',
      }],
      ['droits d\'accès', {
        selector: 'mat-select[formcontrolname="role"]',
        type: 'mat-select',
      }],
      ['territoire', {
        selector: 'app-territory-autocomplete',
        type: 'mat-autocomplete',
      }],
    ])
  ]
]);

module.exports.formInputsSelectors = formInputsSelectors;
module.exports.elementsSelectors = elementsSelectors;