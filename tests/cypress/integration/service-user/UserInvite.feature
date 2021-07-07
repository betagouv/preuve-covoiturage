# language: fr
Fonctionnalité: Inviter un utilisateur

  En tant qu'administrateur je veux pouvoir inviter un utilisateur

  Scénario: Inviter un utilisateur au RPC

    Étant donné que je suis connecté.e comme administrateur du registre
    Et que je suis sur la page "/admin/users/create"
    Alors je vois la section "Ajouter un utilisateur"

    # Inviter

    Lorsque je remplis le formulaire de création utilisateur avec les données suivantes :
      | prénom | Jean-Claude |
      | nom | DUSS |
      | email | jcduss@example.com |
      | numéro de téléphone | 0600000000 |
      | groupe | Registre |
      | droits d'accès | Administration |
    Et que je clique sur le bouton enregistrer
    Alors je vois un message indiquant "L'utilisateur Jean-Claude DUSS a été créé"
    Et je vois que la liste des utilisateurs inclut "jcduss@example.com"
    Alors je me déconnecte

    # Clic sur le lien de l'email
    
    Lorsque je clique sur le bouton "Choisir mon mot de passe" dans l'email "jcduss@example.com"
    Alors je vois la section "Confirmation de votre adresse email"

    # Choix du mot de passe

    Lorsque je remplis le formulaire de confirmation de l'adresse email avec les données suivantes :
      | mot de passe                  | mot-de-passe |
      | confirmation du mot de passe  | mot-de-passe |
    Et je clique sur le bouton envoyer
    Alors je vois un message indiquant "Votre mot de passe a été créé"

    # Connexion utilisateur
    Lorsque je remplis le formulaire de connexion avec les données suivantes :
      | email | jcduss@example.com |
      | mot de passe | mot-de-passe |
    Et que je clique sur le bouton connexion
    Alors je vois l'URL "/trip/stats"
    Alors je me déconnecte

    # Connexion Super admin
    Étant donné que je suis connecté.e comme administrateur du registre
    Et que je suis sur la page "/admin/users"
    Alors je vois la section "Utilisateurs"

    # Suppression de l'utilisateur

    Lorsque je recherche "jcduss@example.com"
    Et que je clique sur le bouton supprimer l'utilisateur de la ligne incluant "jcduss@example.com" de la liste des utilisateurs
    Alors je vois une fenêtre avec le message "Voulez-vous supprimer cet utilisateur ?"
    Lorsque je clique sur le bouton de confirmation
    Alors je vois un message indiquant "L'utilisateur Jean-Claude DUSS a été supprimé"
    Et je vois que la liste des utilisateurs n'inclut pas "jcduss@example.com"
