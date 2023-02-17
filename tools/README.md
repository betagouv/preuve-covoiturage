# Déroulé

1. En amont, le registre communique aux opérateurs une journée définie comme cible pour l'extraction. Un numéro est attribué à chaque opérateur. Le reste des opérations se déroule en présentiel ;

2. Toutes les opérations sont effectuées par le RPC sur une seule machine ("machine RPC") et hors réseau (projection de l'écran à l'appui durant la procédure) ;

3. Le RPC fournit 4 clés USB distinctes. Chaque clé USB est : 
 - formatée en EXT4 sur la “machine RPC” ;
 - physiquement marquée de l'identifiant opérateur (pour 3 clés) ou marquée "RPC" (pour 1 clé) ;
 - montée sur la "machine RPC".

4. Le RPC fait tourner le script qui :
  1. Crée un système de fichier dédié qui sera utilisé comme espace de stockage temporaire pour toutes les opérations ;
  2. Génère 4 fichiers CSV distincts sur les clés opérateurs et RPC :
    - 3 fichiers de transcription ("fichier de transcription opérateur") : Pour chaque numéro de téléphone portable possible ("+336" et "+337"), une chaîne aléatoire ("phone_number_signature"). Un par opérateur, avec des correspondances distinctes ;
    - 1 fichier de collisions ("fichier registre") : contenant la mise en correspondance des 3 "phone_number_signature" qui correspondent aux mêmes numéros dans les “fichiers de transcription” (mais pas les numéros eux-mêmes).
  3. Mélange le fichier registre par paquet d'un million de lignes et le déplace sur la clé dédiée ;
  4. Détruit le système de fichier dédié via `shred`.

5. Chaque opérateur reçoit sa clé et génère chacun un "fichier opérateur" au format CSV, contenant deux colonnes (“operator_journey_id”, “driver_phone_signature” et "passenger_phone_signature") et autant de lignes que de trajets dans la journée de référence. Le fichier est placé à la racine de sa clé USB de l'opérateur ;

6. Les opérateurs remettent au RPC les 3 clés USB. Le RPC valide qu’il est en mesure de récupérer les données et que les volumétries correspondent pour chaque opérateur.
7. Les opérateurs peuvent conserver leurs clés dédiées.

## Lexique

- `operator_journey_id` = `journey_id` dans le payload du trajet envoyé sur `/v2/journeys`
- `driver_phone_signature` = signature du n° de téléphone du conducteur transmise sur la clé
- `passenger_phone_signature` = signature du n° de téléphone du passager transmise sur la clé

## Lancement du script

```
OPERATOR_1_DIRECTORY=/media/... OPERATOR_2_DIRECTORY=/media/... OPERATOR_3_DIRECTORY=/media/... REGISTRY_DIRECTORY=/media/... ./phone.sh start
```
