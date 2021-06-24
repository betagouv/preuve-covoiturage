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
    # Et un lien est envoyé par mail à "admin@example.com" et contient "Choisir un nouveau mot de passe"
    Lorsque je clique sur le bouton "Choisir un nouveau mot de passe" dans l'email "admin@example.com"
    Alors je vois la section "Oubli de mot de passe"

    # Changement du mot de passe

    Lorsque je remplis le formulaire de confirmation de l'adresse email avec les données suivantes :
      | mot de passe                  | mot-de-passe |
      | confirmation du mot de passe  | mot-de-passe |
    Et je clique sur le bouton envoyer
    Alors je vois un message indiquant "Votre mot de passe a été modifié"

    # Test de connexion

    Lorsque je remplis le formulaire de connexion avec les données suivantes :
      | email | admin@example.com |
      | mot de passe | mot-de-passe |
    Et que je clique sur le bouton connexion
    Alors je vois l'URL "/trip/stats"

    # Revert du mot de passe

    Etant donné que je suis sur la page "/admin/profile"
    Alors je vois la section "Informations personnelles"
    Lorsque je remplis le formulaire de changement de mot de passe avec les données suivantes :
      | ancien mot de passe | mot-de-passe |
      | nouveau mot de passe | admin1234 |
      | confirmation du mot de passe | admin1234 |
    Et que je clique sur le bouton mettre à jour
    Alors je vois un message indiquant "Votre mot de passe a été mis à jour"

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
