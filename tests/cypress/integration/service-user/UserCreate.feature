# language: fr
Fonctionnalité: Créer un utilisateur

  En tant qu'administrateur je veux pouvoir créer et supprimer un utilisateur territoire

  Scénario: Créer et supprimer un utilisateur administrateur pour un territoire

    Étant donné que je suis connecté.e comme administrateur du registre
    Alors je vois le menu administration
    Lorsque je clique sur le menu administration
    Alors je vois le titre "Administration"
    Lorsque je clique sur le menu utilisateurs
    Alors je vois l'écran liste des utilisateurs
    Lorsque je recherche "jcduss@example.com"
    Alors je vois que la liste des utilisateurs n'inclut pas "jcduss@example.com"

    # Créer

    Lorsque je clique sur le menu création d'un nouvel utilisateur
    Alors je vois le formulaire de création utilisateur
    Lorsque je remplis le formulaire de création utilisateur avec les données suivantes :
      | prénom | Jean-Claude |
      | nom | DUSS |
      | email | jcduss@example.com |
      | numéro de téléphone | 0600000000 |
      | groupe | Territoire |
      | droits d'accès | Administration |
      | territoire | Ile-De-France | 
    Et que je clique sur le bouton enregistrer
    Alors je vois un message indiquant "L'utilisateur Jean-Claude DUSS a été créé"
    Et un lien est envoyé par mail à "jcduss@example.com"
    Et je vois que la liste des utilisateurs inclut "jcduss@example.com"

    # Supprimer

    Lorsque je clique sur le bouton supprimer l'utilisateur de la ligne incluant "jcduss@example.com" de la liste des utilisateurs
    Alors je vois une fenêtre avec le message "Voulez-vous supprimer cet utilisateur ?"
    Lorsque je clique sur le bouton de confirmation
    Alors je vois un message indiquant "L'utilisateur Jean-Claude DUSS a été supprimé"
    Et je vois que la liste des utilisateurs n'inclut pas "jcduss@example.com"
