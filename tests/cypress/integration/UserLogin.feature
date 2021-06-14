# language: fr
Fonctionnalité: Connexion utilisateur

  En tant qu'utilisateur non connecté, je me connecte ou des erreurs m'indiquent le problème

  Scénario: Un utilisateur inconnu essaie de se connecter
    
    Étant donné que je suis sur la page "/login"
    Alors je vois un message indiquant "Connectez-vous à votre compte"
    Lorsque je remplis le formulaire de connexion avec les données suivantes :
      | email | utilisateur.inconnu@example.com |
      | mot de passe | password |
    Et que je clique sur le bouton envoyer
    Alors je vois un message indiquant "Mauvais email ou mot de passe"
