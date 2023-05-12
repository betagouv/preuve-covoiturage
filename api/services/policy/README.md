---
title: Campagnes
---

# Policy (campaign) service

Configure and execute campaign algorithms.

## Actions

### Apply `yarn ilos campaign:apply`

Applique les règles de calcul de la campagne sur les trajets éligibles. Stocke le résultat du calcul dans `policy.incentives` dans les champs `amount` et `result`.

On parle de règles _stateless_ car elles sont calculées uniquement dans le contexte du trajet.

```
Paramètres:

  -c / --campaigns                Liste des _id de campagnes séparées par des virgules.
                                  Toutes les campagnes sont sélectionnées si on ne passe par d'_id
                                  ex: 1,2,3

  -f / --from                     Date de début (YYYY-MM-DD) dans la timezone locale

  -t / --to                       Date de fin (YYYY-MM-DD) dans la timezone locale

  --tz                            Timezone utilisateur (Europe/Paris par défaut)

  -d / --detach                   Calculer chaque campagne dans une tâche de fond

  --override                      Écraser les calculs existants.
                                  /!\ Attention aux implications sur les montants des clés et
                                  les autres tables à nettoyer en cas de recalcul.
```

### Finalize `yarn ilos campaign:finalize`

Corrige le montant calculé en fonction du contexte global de la campagne. On parle de règles _stateful_.

Les valeurs sont corrigées dans le champ `amount` alors que le champ `result` conserve la valeur _stateless_ calculée par `campaign:apply`.

```
Paramètres:

  -f / --from                     Date de début (YYYY-MM-DD) dans la timezone locale

  -t / --to                       Date de fin (YYYY-MM-DD) dans la timezone locale

  --tz                            Timezone utilisateur (Europe/Paris par défaut)

  -d / --detach                   Calculer chaque campagne dans une tâche de fond

  --resync                        Synchronise la clé max_amount_restriction.global.campaign.global
                                  et le incentive_sum de la campagne avant de finaliser les incentives.

  --clear                         Supprime les locks morts dans la table policy.lock pour forcer
                                  l'exécution du finalize
```
