---
title: Campagnes
---

# Policy (campaign) service

Configure and execute campaign algorithms.

## Variables d'environnement

Config : `src/config/policies.ts`

| Variable | Type | Défaut | Commentaire |
| --- | --- | --- | --- |
| `APP_DISABLE_POLICY_PROCESSING` | `boolean` | `false` | Bloque l'execution de `apply` et `finalize` |
| `APP_POLICY_FINALIZE_DEFAULT_FROM` | `number` | 15 | Nombre de jours pour le début de la plage de temps de finalisation. |
| `APP_POLICY_FINALIZE_DEFAULT_TO` | `number` | 5 | Nombre de jours pour la fin de la plage de temps de finalisation. Les incitations seront finalisées entre -15 et -5 jours. |

## Actions

### Apply `npm run ilos campaign:apply`

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

### Finalize `npm run ilos campaign:finalize`

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

### Exemples d'utilisation

> On préfixe la commande de `APP_POSTGRES_TIMEOUT=0 APP_REQUEST_TIMEOUT=0 APP_LOG_LEVEL=debug` pour éviter les timeout et avoir un maximum d'infos de debug (si besoin).  
> L'execution de `apply` et `finalize` peut être bloquée par la variable `APP_DISABLE_POLICY_PROCESSING=true` que l'on peut débloquer en préfixant la commande avec `APP_DISABLE_POLICY_PROCESSING=false`.
>
> _Ces variables ne sont appliquées que dans le contexte de la commande_.

#### CRON job quotidien

Utilisé pour lancer quotidiennement le calcul des incitations et leur finalisation. Le `apply` est appliqué aux incitations jusqu'à aujourd'hui et le `finalize` aux incitations jusqu'à -5 jours.

Ces commandes sont appelées dans le fichier `cron.json` utilisé par Scalingo.

```shell
# Stateless en background job sur toutes les campagnes
npm run ilos campaign:apply --detach

# Stateful en background job (toujours sur toutes les campagnes)
# Sans re-synchro de la clé max_amount
npm run ilos campaign:finalize --detach

# Avec re-synchro de la clé max_amount
npm run ilos campaign:finalize --detach --resync
```

#### Lancer / relancer le calcul des incitations

Pour s'assurer que tout a bien été calculé, on peut relancer le calcul sans risque de doublons.

```shell
npm run ilos campaign:apply
npm run ilos campaign:finalize
```

#### Forcer le déblocage du _lock_ s'il y a eu un problème

Pour lister les locks, dans la DB.

```sql
SELECT * FROM policy.lock ORDER BY _id DESC LIMIT 50;
```

Si un _lock_ n'a pas de `stopped_at` c'est qu'il est en train de tourner. Si le process a crashé, on peut le débloquer.

```shell
npm run ilos campaign:finalize --clear
```

> Les _locks_ débloqués sont conservés en base avec un `stopped_at` à la date d'execution de la commande et un `success = false`.

#### Rejouer des incitations sur une période donnée

Si on constate des erreurs de calcul, qu'une règle a été modifiée dans le fichier `<Campagne>.ts` ou autre raison nécessitant le recalcul des incitations, c'est possible avec la commande suivante.

On précise l'ID de la campagne, les dates de début (`-f`) et de fin (`-t`) et on écrase les valeurs (`--override`).

:warning: Attention ! il faut refaire un `finalize` sur toutes les incitations à partir de cette date car l'application des seuils sera faussée. Il faut également utiliser `--resync` pour re-synchroniser la valeur de consommation de l'enveloppe (`max_amount`).

```shell
npm run ilos campaign:apply -c <campaign_id> -f <YYYY-MM-DD> -t <YYYY-MM-DD> --override
npm run ilos campaign:finalize -f <YYYY-MM-DD> -t <YYYY-MM-DD> --resync
```

> Il est possible de nettoyer la base manuellement des incitations calculées avant de tout rejouer. Voir les tables `policy.incentives` et `policy.policy_metas`.