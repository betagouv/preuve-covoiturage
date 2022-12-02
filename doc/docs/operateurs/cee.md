# API CEE

## Présentation

Dans le cadre des fiches standardisées et bonifiée pour le covoiturage courte et longue distance, le Registre de preuve de covoiturage met à disposition des opérateurs de covoiturage, une API (Application Programming Interface, voir [qu'est-ce qu'une API ?](https://api.gouv.fr/guides/api-definition)) permettant à ces derniers de vérifier en partie l'éligibilité d'un dossier de demande CEE (vérification de l'historique et du dédoublonnage) et  de récolter des données du RPC necessaire à la bonne constitution du dossier avant l'envoi de celui-ci par l'opérateur de covoiturage auprès du PNCEE.

Cette API a pour but de fluidifier et de fiabiliser les demandes de dossier afin d'éviter un maximum de refus de ces derniers par le PNCEE en cas de doublon par exemple. 

> Définitions : 
> * CEE : Crédits d'Economie d'Energie
> * PNCEE : Pôle National des Crédits d'Economie d'Energie

## Ressources utiles

- [Arrêté de création des opérations standardisées CEE covoiturage (fonctionnement non bonifié)](https://www.legifrance.gouv.fr/jorf/id/JORFSCTA000046374229) 
- Arrêté de création de la bonification : en cours 

## Objectifs de l'API

- vérification de l'éligibilité d'un usager à l'opération standardisée : 
  - vérification de l'historique : invalidation des usagers ayant déjà bénéficiés d'opérations spécifiques 3 ans avant la réalisation du trajet. Comparatif sur la base des données transmises par les opérateurs
  - vérification dédoublonnage : invalidation des usagers ayant déjà bénéficiés de l'opération standardisée quelque soit la plateforme de covoiturage utilisée.
- confirmation de l'éligibilité et mise à disposition d'éléments constitutifs du dossier de demande de prime
  - transmission des éléments suivants : journey_id; status et token (signature RPC)


## Utilisation de l'API

L'utilisation de l'API nécessite la possession d'un token applicatif comme décrit dans [la documentation de l'API de preuve](/operateurs/acces.html). 2 environnements seront alors accessibles : 

* 1 environnement de pré-production pour la réalisation des tests

> Pré-production : https://api.demo.covoiturage.beta.gouv.fr (opens new window)


* 1 environnement de production

> Production : https://api.covoiturage.beta.gouv.fr (opens new window)

## Fonctionnalité de l'API

Trois fonctionnalités sont proposées :

### 1. Simuler une demande CEE

> Possibilité de simuler une demande avant la réalisation du trajet par un usager afin de vérifier partiellement la pré-éligibilité de ce dernier (vérification de l'historique mais pas du dédoublonnége). 
Seront nécessaire : numéros de permis de conduire, trois premières lettres du nom de famille et 8 premiers chiffres du numéro de téléphone. Cf la documentation /policies/cee/simulate.

### 2. Enregistrer une demande CEE 

> Vérification complète de l'éligibilité de l'usager (historique et dédoublonnage) et enregistrement de la demande CEE dans l'API CEE : 
> * Si la conformité de la demande est valide, alors une réponse 201 est retournée validant l'enregistrement de la demande.
> * Si une demande a déjà enregistrée pour l'usager en question, alors une réponse 409 est retournée avec la date à laquelle l'enregistremennt a été fait.
> * Si le trajet envoyé n'est pas trouvé, alors une réponse 404 est retournée.


> **Ce point d'API est consultable à J+7 pour la courte et la longue distance, J étant la date de réalisation du trajet. 
Il est prévu que ce délai soit réduit à 48h après la réalisation du trajet suite au déploiement de l’API V3.**

### 3. Importer des demandes CEE existantes par lot

> Envoi par chaque opérateur concerné de l'historique des bénéficiaires d'opérations spécifiques sur les 3 années précédents 2023. Pour chaque bénéficiaires les informations suivantes seront requises : phone_trunc, last_name_trunc, datetime et journey_type
À noter que ce point d'API ne sera peut être pas mis en place et remplacé par un CSV standardisé.

> **Afin que l'API soit fonctionnelle, les opérateurs doivent faire remonter l'historique au plus tôtô au registre.**

## Des questions ?

Contactez equipe [chez] covoiturage.beta.gouv.fr
