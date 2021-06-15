export const elementsSelectors = new Map<string, string>([
  ['le menu administration', 'button[mattooltip="Administration"]'],
  ["la navigation de l'administration", '[data-test="nav-admin"]'],
  ['le menu utilisateurs', 'a[href="/admin/users"]'],
  ["le menu création d'un nouvel utilisateur", '[data-test="user-create"]'],
  ["l'écran liste des utilisateurs", '[data-test="user-list"]'],
  ['la liste des utilisateurs', '[data-test="user-list"] table tbody'],
  ['le formulaire de création utilisateur', '[data-test="user-upsert"]'],
  ['le bouton modifier du premier utilisateur', '[data-test="user-edit"]:first'],
  ["le bouton ré-inviter l'utilisateur", '[data-test="user-reinvite"]'],
  ["le bouton éditer l'utilisateur", '[data-test="user-edit"]'],
  ["le bouton supprimer l'utilisateur", '[data-test="user-delete"]'],
  ['une fenêtre', 'mat-dialog-container'],
  ['le titre', '.page-title'],
  ['la section', '[data-test="section-title"]'],
  ['le bouton de confirmation', 'button.confirm'],
  ['Mot de passe oublié', '[data-test="forgotten-password"]'],
  ['le bouton enregistrer', '[data-test="button-submit"]'],
  ['le bouton envoyer', '[data-test="button-submit"]'],
  ['le bouton connexion', '[data-test="button-submit"]'],
  ['le bouton annuler', '[data-test="button-reset"]'],
]);

export function getElementSelectorFromName(name: string): string {
  return elementsSelectors.get(name);
}
