---
title: token
description: méthode pour alimenter le registre via l'API
---
# Alimenter le registre via l'API

Envoyer un trajet de covoiturage à l’API du Registre de Preuve de Covoiturage nécessite que plusieurs critères soient remplis.

* 1️⃣  Une entité “**opérateur de covoiturage**” est créée sur l’application du registre.
* 2️⃣  Un utilisateur appartenant à cet opérateur de covoiturage est **administrateur**.
* 3️⃣  L’administrateur opérateur **crée un token applicatif**.
* 4️⃣  Ce token applicatif est **installé sur le serveur de l’opérateur** qui va envoyer les données et sera passé dans le _Header_ de chacune des requêtes.
* 5️⃣  Le serveur peut **communiquer** avec les serveurs suivants :
  1. Production : [https://api.covoiturage.beta.gouv.fr](https://api.covoiturage.beta.gouv.fr)
  2. Pré-production : [https://api-staging.covoiturage.beta.gouv.fr](https://api-staging.covoiturage.beta.gouv.fr) [a modifier]

### 1️⃣ & 2️⃣ - Accéder à l’application du registre

Afin de valider les critères  1️⃣  et  2️⃣ , veuillez contacter l'équipe du Registre (technique@covoiturage;Beta.gouv.fr). En effet, ces opérations sont réalisées par un membre de l’équipe du Registre de preuve de covoiturage.

### 3️⃣ - Créer un token applicatif

Cette manipulation est réalisable, uniquement pour les utilisateurs dits administrateurs, sur l'interface applicative du Registre de preuve de covoiturage. 

1. Créer un nouveau token ;
2. Donner un nom à ce token ; 
3. Copier le token généré et le conserver de manière sécurisée. **Il devra être envoyé dans le header de chaque requête serveur.**

{% hint style="danger" %}
Ce token ne pourra pas être ré-affiché ni récupéré. Si le token est perdu, il doit être recréé par la même procédure.
{% endhint %}

### 4️⃣ & 5️⃣ - Logique de connexion au service

Le token applicatif donné lors de la création de l’application doit être envoyé dans les Headers des requêtes serveurs comme ceci :

`Authorization: Bearer {token}`

Seule la route `POST /v2/journeys` accepte l’authentification avec ce token.  
Une erreur `401 Unauthorized` est retournée pour les tokens invalides.  
Un code de retour `201 Created` est retourné quand la preuve est acceptée.

{% hint style="info" %}
Les tokens n’expirent pas dans le temps mais ils peuvent être mis sur une liste noire en cas d’utilisation anormale.
{% endhint %}

### Limitations du nombre de requêtes

Le nombre de requêtes envoyées sur la route d'acquisition des preuves est de **20000 par minute**. Au delà, merci de différer les envois en plusieurs blocs espacés de quelques minutes.  
_Les autres routes de l'application ont des limites beaucoup plus basses._
