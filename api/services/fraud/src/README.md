# Fonctionnement général

Le coeur métier se trouve dans src/engine. On y trouve notamment : 
- l'orchestrateur des tests (CheckEngine) ;
- les tests ;

Chaque test a deux volets :
- le préparateur (PrepareCheckInterface) ;
- le calculateur (HandleCheckInterface) ;

Le premier prépare les données en allant les chercher dans la base. Le second renvoie un flotant.

Par exemple, un test qui vise à détecter une distance trop courte va utiliser un préparateur qui va chercher la distance et va implémenter un calculateur qui reverra un flotant [0, 1];

Ces deux volets peuvent être implémentés dans deux classes distinctes ou dans la même classe.

L'orchestrateur va chercher la liste des tests puis regroupe les tests par préparateur puis lance les calculs.

## Actions
- ApplyAction est une action qui va raffraichir la liste des trajets à itérer puis ajoute à la file d'attente les tests à lancer ;
- CheckAction est l'action qui lance les calculs et notifie Carpool en cas de dépassement du seuil autorisé ;

## Tests

Les tests sont découpés de manière atomique et sont regroupés par type de données consommées.

### DatetimeIdentity
Ce groupe de tests vise à détecter des trajets qui partage l'identité du passager et le créneau horaire.

- DatetimeIdentityCollisionCheck : test sur la participation à d'autres trajets sur la même période temporelle ;
- DatetimeIdentitySequenceCheck : test sur la participation à d'autres trajets sur des périodes proches ;

### SelfCheck
Ce groupe de tests vise à détecter des incohérence de données au sein d'un trajet (distance trop courte, nombre de passager anormalement élevé, etc.).

- EndLatitudeCollisionCheck : test sur le delta entre la latitude de fin du passager et du conducteur ;
- EndLongitudeCollisionCheck : test sur le delta entre la longitude de fin du passager et du conducteur ;
- HighDurationCheck : test sur la durée du trajet ;
- HighSeatCheck : test sur le nombre de siège réservé ;
- LowDurationCheck : test sur la durée du trajet ;
- StartEndLatitudeCollisionCheck : test sur le delta entre la latitude de début et de fin ;
- StartEndLongitudeCollisionCheck  test sur le delta entre la longitude de début et de fin ;
- StartLatitudeCollisionCheck : test sur le delta entre la latitude de début du passager et du conducteur ;
- StartLongitudeCollisionCheck : test sur le delta entre la longitude de début du passager et du conducteur ;
- TheoricalDistanceAndDurationCheck : test sur le delta entre la distance/durée théorique et réelle ;

### TripIdentity
Ce groupe de tests vise à détecter au sein d'un regroupement de couple des incohérence entre les identités passagers (plusieurs fois le même passager par exemple).

- TripIdentityEmailCollisionCheck : test sur la correspondance d'email ;
- TripIdentityFirstnameCollisionCheck : test sur la correspondance de prénom ;
- TripIdentityFullnameCollisionCheck :  test sur la correspondance de nom complet (prénom + nom) ;
- TripIdentityLastnameCollisionCheck :  test sur la correspondance de nom de famille ;
- TripIdentityPhoneCollisionCheck : test sur la correspondance de téléphone complet ;
- TripIdentityPhoneTruncCollisionCheck : test sur la correspondance de téléphone tronqué ;
- TripIdentityTravelpassCollisionCheck : test sur la correspondance de numéro de carte de transport ;
- TripIdentityUserIdCollisionCheck : test sur la correspondance de numéro d'utilisateur (chez l'opérateur) ;

### Others
- TripDatetimeInconsistencyCheck : test sur le delta entre le moment du départ du conducteur au sein des différents couples formant le trajet ;
- TripDriverIdentityInconsistencyCheck : test sur la constance du conducteur au sein des différents couples formant le trajet ;
