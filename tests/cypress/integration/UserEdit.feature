# language: fr
Fonctionnalité: Créer un utilisateur

  En tant qu'administrateur je veux pouvoir éditer un utilisateur opérateur

  Scénario: Créer, modifier et supprimer un utilisateur

    Étant donné que je suis connecté.e comme administrateur du registre
    Alors je vois le menu administration
    Lorsque je clique sur le menu administration
    Alors je vois le titre "Administration"
    Lorsque je clique sur le menu utilisateurs
    Alors je vois l'écran liste des utilisateurs
    Et je vois que la liste des utilisateurs n'inclut pas "covoiturix@example.com"

    # Créer

    Lorsque je clique sur le menu création d'un nouvel utilisateur
    Alors je vois le formulaire de création utilisateur
    Lorsque je remplis le formulaire de création utilisateur avec les données suivantes :
      | prénom | Mega |
      | nom | Covoiturix |
      | email | covoiturix@example.com |
      | numéro de téléphone | 0600000000 |
      | groupe | Opérateur |
      | droits d'accès | Administrateur |
      | opérateur | MaxiCovoit |
    Et que je clique sur le bouton enregistrer
    Alors je vois un message indiquant "L'utilisateur Mega Covoiturix a été créé"
    Et un lien est envoyé par mail à "covoiturix@example.com"
    Et je vois que la liste des utilisateurs inclut "covoiturix@example.com"

    # Editer

    Lorsque je clique sur le bouton éditer l'utilisateur de la ligne incluant "covoiturix@example.com" de la liste des utilisateurs
    Et que je remplis le formulaire de création utilisateur avec les données suivantes :
      | nom | Covoiturax |
    Et que je clique sur le bouton enregistrer
    Alors je vois un message indiquant "Mega Covoiturax a été mis à jour"
    Et je vois que la liste des utilisateurs inclut "Covoiturax"

    # Supprimer

    Lorsque je clique sur le bouton supprimer l'utilisateur de la ligne incluant "covoiturix@example.com" de la liste des utilisateurs
    Alors je vois une fenêtre avec le message "Voulez-vous supprimer cet utilisateur ?"
    Lorsque je clique sur le bouton de confirmation
    Alors je vois un message indiquant "L'utilisateur Mega Covoiturax a été supprimé"
    Et je vois que la liste des utilisateurs n'inclut pas "covoiturix@example.com"
