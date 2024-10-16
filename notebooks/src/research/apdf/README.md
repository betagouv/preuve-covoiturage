# APDF Checker

Objectif : automatiser la vérification des fichiers d'APDF chaque mois.

#### Sources de données

- API : configuration de la campagne
- DB : caractéristiques de la campagne
- S3 : listing des fichiers sur le bucket
- XLSX : fichier APDF à vérifier

#### Déroulé

Vérifier une **campagne** sur un **mois** précis.

1. Récupérer les données de la campagne (API): id, start_date, end_date, max_amount...
2. Récupérer les fichiers sur le S3
3. Lancer les checks

#### Checks

1. Tous les opérateurs listés dans la campagne ont un fichier APDF
    1. fail possible si pas de trajets sur le mois en question pour cet opérateur (vérifier avec une requête ?)
2. Trajets de début au premier du mois
3. Trajets de fin le dernier jours du mois
4. Trajets tous les jours du mois (peut varier en fonction des opérateurs)
5. La somme totale correspond à la page 1
6. La somme par tranche correspond à la page 1
7. Le nombre de trajets correspond à la page 1
8. Le nombre de trajets par tranche correspond à la page 1
9. Le nombre de trajets correspond à la page 1 pour les trajets incités / non incités
10. Le nombre de trajets par tranche correspond à la page 1 pour les trajets incités / non incités
11. max_amount atteint à quelle date ?

#### Stats

1. % de trajets incités
2. moyenne d'incitation par trajet
