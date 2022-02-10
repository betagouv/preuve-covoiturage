# Attestations opérateurs

::: tip Attestation sur l'honneur
Cette page concerne les attestations fournies par les opérateurs de covoiturage.

Rendez-vous sur [https://attestation.covoiturage.beta.gouv.fr/](http://attestation.covoiturage.beta.gouv.fr/) pour générer votre attestation sur l'honneur.
:::

::: warning Cette fonctionnalité est en cours de développement.

En tant qu'opérateur de covoiturage, contactez nous si vous souhaitez y participer : [technique@covoiturage.beta.gouv.fr](mailto:technique@covoiturage.beta.gouv.fr)

Merci de [créer des tickets](https://github.com/betagouv/preuve-covoiturage/issues/new?template=certificate.md&labels=ATTESTATION&assignees=jonathanfallon) si vous rencontrez des problèmes.
:::

Une attestation de covoiturage est un document retraçant les trajets d'une personne sur une durée donnée.
Cette attestation au format PDF imprimable A4 est produite à la demande de l'utilisateur·rice et au travers de la plateforme avec laquelle les trajets sont effectués.

Dans le cadre du Forfait Mobilités Durables par exemple, l'attestation permet à l'employeur de prendre en charge tout ou partie des frais engagés par l'employé·e selon ses propres modes de calcul.

## Statut de développement des fonctionnalités

- ✅ Génération de l'attestation par l'opérateur ;
- ✅ Téléchargement d'un PDF ;
- ✅ Page de vérification de l'attestation en ligne \(accès public\) ;
- ✅ Envoi de meta-données pour injecter les données personnelles du covoitureur ;
- ✅ Upload du logo de l'opérateur dans son profil.

## Étapes de génération d'une attestation PDF

1. [Création de l'attestation](/operateurs/attestations/creer)  
   Sur la base des données d'identité fournies, les données de trajet liées à cette personne sont compilées et sauvegardées avec un identifiant unique qui permettra de récupérer et vérifier l'attestation.
2. [Téléchargement du PDF](/operateurs/attestations/telecharger)  
   L'identifiant unique de l'attestation est utilisé pour générer un PDF imprimable. Les données stockées lors de la création de l'attestation sont mises en forme sur un document au format A4.
