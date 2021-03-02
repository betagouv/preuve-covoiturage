# language: fr
Fonctionnalité: Créer un utilisateur

  En tant qu'administrateur je veux pouvoir créer et supprimer un utilisateur territoire

  Scénario: Créer et supprimer un utilisateur découverte pour un territoire
    Étant donné que je suis connecté.e comme administrateur du registre
    Alors je vois le menu administration
    Lorsque je clique sur le menu administration
    Alors je vois le titre "Administration"
    Lorsque je clique sur le menu utilisateurs
    Alors je vois l'écran liste des utilisateurs
    Et je vois que la liste des utilisateurs inclut "territory@example.com"
    Et je vois que la liste des utilisateurs n'inclut pas "1ycau.admin@inbox.testmail.app"
    Lorsque je clique sur le menu création d'un nouvel utilisateur
    Alors je vois le formulaire de création utilisateur
    Lorsque je remplis le formulaire de création utilisateur avec les données suivantes :
      | prénom | Jean-Claude |
      | nom | DUSS |
      | email | 1ycau.admin@inbox.testmail.app |
      | numéro de téléphone | 0600000000 |
      | groupe | Territoire |
      | droits d'accès | Découverte |
      | territoire | Syndicat Mixte Des Transports En Commun Du Territoire De Belfort |
    Et que je clique sur le bouton créer un utilisateur
    Alors je vois un message indiquant "L'utilisateur Jean-Claude DUSS a été créé"
    Et je vois que la liste des utilisateurs inclut "1ycau.admin@inbox.testmail.app"
    Lorsque je clique sur le bouton supprimer l'utilisateur de la ligne incluant "1ycau.admin@inbox.testmail.app" de la liste des utilisateurs
    Alors je vois une fenêtre avec le message "Voulez-vous supprimer cet utilisateur ?"
    Lorsque je clique sur le bouton "Oui"
    Alors je vois un message indiquant "L'utilisateur Jean-Claude DUSS a été supprimé"
    Et je vois que la liste des utilisateurs n'inclut pas "1ycau.admin@inbox.testmail.app"
