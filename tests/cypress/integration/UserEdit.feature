# language: fr
Fonctionnalité: Créer un utilisateur

  En tant qu'administrateur je veux pouvoir éditer un utilisateur opérateur

  Scénario: Éditer un utilisateur opérateur
    Étant donné que je suis connecté.e comme administrateur du registre
    Alors je vois le menu administration
    Lorsque je clique sur le menu administration
    Alors je vois le titre "Administration"
    Lorsque je clique sur le menu utilisateurs
    Alors je vois que la liste des utilisateurs inclut "territory@example.com"
    Lorsque je clique sur le bouton "Opérateur"
    Alors je vois l'écran liste des utilisateurs
    Et je vois que la liste des utilisateurs n'inclut pas "1ycau.operator@inbox.testmail.app"
    Lorsque je clique sur le menu création d'un nouvel utilisateur
    Alors je vois le formulaire de création utilisateur
    Lorsque je remplis le formulaire de création utilisateur avec les données suivantes :
      | prénom | Mega |
      | nom | Covoiturix |
      | email | 1ycau.operator@inbox.testmail.app |
      | numéro de téléphone | 0600000000 |
      | groupe | Opérateur |
      | droits d'accès | Administrateur |
      | opérateur | Maxicovoit |
    Et que je clique sur le bouton créer un utilisateur
    Alors je vois un message indiquant "L'utilisateur Mega Covoiturix a été créé"
    Et un lien est envoyé par mail à "1ycau.operator@inbox.testmail.app"
    Et je vois que la liste des utilisateurs inclut "1ycau.operator@inbox.testmail.app"
    Lorsque je clique sur le bouton éditer l'utilisateur de la ligne incluant "1ycau.operator@inbox.testmail.app" de la liste des utilisateurs
    Et que je remplis le formulaire de création utilisateur avec les données suivantes :
      | nom | Covoiturax |
    Et que je clique sur le bouton mettre à jour un utilisateur
    Alors je vois un message indiquant "Les information ont bien été modifiées"
    Et je vois que la liste des utilisateurs inclut "Covoiturax"
    Lorsque je clique sur le bouton supprimer l'utilisateur de la ligne incluant "1ycau.operator@inbox.testmail.app" de la liste des utilisateurs
    Alors je vois une fenêtre avec le message "Voulez-vous supprimer cet utilisateur ?"
    Lorsque je clique sur le bouton de confirmation
    Alors je vois un message indiquant "L'utilisateur Mega Covoiturix a été supprimé"
    Et je vois que la liste des utilisateurs n'inclut pas "1ycau.operator@inbox.testmail.app"
