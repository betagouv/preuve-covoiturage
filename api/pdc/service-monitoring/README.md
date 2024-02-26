---
title: Monitoring
---

# Service de Monitoring

Outils de statistiques et de monitoring du système.

## Actions

> Les actions sont souvent appelées par les commandes décrites ci-dessous.

### Statistiques sur les trajets

`JourneysStatsAction.ts`: `monitoring:journeysstats`

### Refresh des vues matérialisées

`StatsRefreshAction.ts`: `monitoring:statsrefresh`

Les vues matérialisées du schema passé en argument sont listées et filtrées par préfixe :

- `monthly`: chaque 1er jour du mois
- `weekly`: chaque lundi
- `daily`: chaque jour

> Les tables n'ayant pas de préfixe de la liste précédente sont exécutés chaque jour.

Les vues filtrées sont rafraichies à la suite. Executer les requêtes en parallèle est trop coûteux pour la base de données et ne donne pas de meilleures performances.

## Commandes

### Statistiques sur les trajets

```
npm run ilos monitoring:journeysstats

Options:
  -u, --database-uri     Connection string Postgresql
```

### Refresh des vues matérialisées

Cette commande est appelée quotidiennement dans `cron.json`

```
npm run ilos monitoring:stats:refresh

Options:
  -s, --schema           Schema de base à utiliser.
  --sync                 Executer l'action directement. Sans l'option
                         un job est créé et executé par le worker.
```
