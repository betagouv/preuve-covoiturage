# language: fr
Fonctionnalité: Créer un utilisateur

  En tant qu'administrateur je veux pouvoir créer un utilisateur territoire

  Scénario: Créer un utilisateur découverte pour un territoire
    Étant donné que je suis connecté.e comme administrateur du registre
    Alors je vois le menu administration
    Lorsque je clique sur le menu administration
    Alors je vois le titre "Administration"
    Lorsque je clique sur le menu utilisateurs
    Alors je vois l'écran liste des utilisateurs
    Et je vois que la liste des utilisateurs inclut "territory@example.com"
    Et je vois que la liste des utilisateurs n'inclut pas "margot.sanchez34+JC@gmail.com"
    Lorsque je clique sur le menu création d'un nouvel utilisateur
    Alors je vois le formulaire de création utilisateur
    Lorsque je remplis le formulaire de création utilisateur avec les données suivantes :
      | prénom | Jean-Claude |
      | nom | DUSS |
      | email | margot.sanchez34+JC@gmail.com |
      | numéro de téléphone | 0600000000 |
      | groupe | Territoire |
      | droits d'accès | Découverte |
      | territoire | Syndicat Mixte Des Transports En Commun Du Territoire De Belfort |
    Et que je clique sur le bouton créer un utilisateur
    Alors je vois un message indiquant "L'utilisateur Jean-Claude DUSS a été créé"
    Et je vois que la liste des utilisateurs inclut "margot.sanchez34+JC@gmail.com"
