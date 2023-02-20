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

  policy_id (obligatoire)         L'ID de la campagne

  override_from                   Date au format ISO à partir duquel le calcul est effectué.
                                  Sans passer ce paramètre, les 7 derniers jours sont utilisés.
                                  /!\ Attention aux implications sur les montants des clés et
                                  les autres tables à nettoyer en cas de recalcul.

  override_until                  Date au format ISO pour limiter la période de recalcul.
                                  A utiliser en conjonction avec override_from uniquement.
                                  Par défaut, la date du jour de la fin de la campagne est utilisée.
```

### Finalize `yarn ilos campaign:finalize`

Corrige le montant calculé en fonction du contexte global de la campagne. On parle de règles _stateful_.

Les valeurs sont corrigées dans le champ `amount` alors que le champ `result` conserve la valeur _stateless_ calculée par `campaign:apply`.

