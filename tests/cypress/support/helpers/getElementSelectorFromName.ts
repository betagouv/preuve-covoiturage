export const elementsSelectors = new Map<string, string>([
  ['le menu administration', 'button[mattooltip="Administration"]'],
  ['le menu utilisateurs', 'a[href="/admin/all-users"]'],
  ["le menu création d'un nouvel utilisateur", 'button[mattooltip="Ajouter un utilisateur"]'],
  ['le bouton créer un utilisateur', 'form.CreateEditUserForm button[type="submit"]'],
  ["l'écran liste des utilisateurs", 'div.Users-list'],
  ['la liste des utilisateurs', 'div.Users-list table tbody > tr'],
  ['le formulaire de création utilisateur', 'form.CreateEditUserForm'],
  ["le bouton supprimer l'utilisateur", 'mat-icon[mattooltip="Supprimer l\'accès"]'],
  ['une fenêtre', 'mat-dialog-container'],
  ['le titre', '.page-title'],
  ['le bouton de confirmation', 'button.confirm'],
]);

export function getElementSelectorFromName(name: string): string {
  return elementsSelectors.get(name);
}
