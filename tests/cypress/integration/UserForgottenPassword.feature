# language: fr
Fonctionnalité: Mot de passe oublié

  En tant qu'utilisateur non connecté, je dois pouvoir récupérer un lien de changement de mot de passe par email

  Scénario: Un utilisateur existant a perdu son mot de passe
    
    Étant donné que je suis sur la page "/login"
    Alors je vois un message indiquant "Connectez-vous à votre compte"
    Lorsque je clique sur Mot de passe oublié
    Alors je vois un message indiquant "Veuillez renseigner votre email pour réinitialiser votre mot de passe."
    Lorsque je remplis le champ email avec les données suivantes :
      | email | admin@example.com |
    Et que je clique sur le bouton envoyer
    Alors je vois un message indiquant "Un lien de changement de mot de passe vous a été envoyé"
    Et un lien est envoyé par mail à "admin@example.com" et contient "Choisir un nouveau mot de passe"

  Scénario: Un utilisateur inconnu a perdu son mot de passe
    
    Étant donné que je suis sur la page "/login"
    Alors je vois un message indiquant "Connectez-vous à votre compte"
    Lorsque je clique sur Mot de passe oublié
    Alors je vois un message indiquant "Veuillez renseigner votre email pour réinitialiser votre mot de passe."
    Lorsque je remplis le champ email avec les données suivantes :
      | email | utilisateur.inconnu@example.com |
    Et que je clique sur le bouton envoyer
    Alors je vois un message indiquant "Un lien de changement de mot de passe vous a été envoyé"
    Et "utilisateur.inconnu@example.com" n'a rien reçu
