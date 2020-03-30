# Création de campagne tests case 

### Cypress test base 1

- Eligibilité
	- vérifier que toutes les jours soit selectionnée par défaut 
	- Décocher le samedi dimanche
	- Entrer des horaire début et fin 10, 20
	- Entrer les distances 5 et 110
	- Ajouter des exception dans les trajets
		- Lyon > Venissieux
	- Vérifier que toutes les classes
		- décocher la A et la C
	- Ne selectionner que les conducteurs
	- Vérifier si tous les opérateur sont selectionné par défaut
	- Passer a l'étape suivante
- Rétribution
	- Rentrer une rétribution de 10 000 pts
	- Mettre une date de début 01/06/2020 au 02/07/2020
	- mettre 10 trajets max
	- créer 2 restrictions
		- 20 point(s) maximum pour le passager par mois.
		- 30 trajet(s) maximum pour le passager sur une année.
	- Verifier qu'il a Conducteur (Pour le conducteur) et pas passager dans la
	- Entrer le montant zero
		- Vérifier la présence de l'erreur "Au moins une des rétributions doit avoir un montant supérieur à zéro."
	- Entrer 20, cocher par km, cocher par passager.
	- Vérifier "Prendre en compte l'ensemble des places réservées par le conducteur et ses passagers" cocher par défaut"
	
	- Passer à l'étape suivante
	
- Vérifier dans le texte
	- du lundi 01 juin 2020 au jeudi 02 juillet 2020
	- lundi, mardi, mercredi, jeudi, vendredi
	- non samedi dimanche 
	- 10h00 à 20h00
	- 10 000 points.
	- 5 à 110 km
	- 20 point(s) par trajet par km par passager pour le conducteur.
	- 20 point(s) maximum pour le passager par mois.
	- 30 trajet(s) maximum pour le passager sur une année.
	- à tous les opérateurs
	- des preuves de classe B
  - Les axes suivants ne sont pas incités
	- De Lyon à Vénissieux	

### Cypress test base 2

- Eligibilité

	- Selectionner Trajets autorisé
    - Vérifier l'erreur "Au moins une règle de trajets doit être définie."
		- Vienne > St Etienne
	- Vérifier que toutes les classes
		- décocher la B
	- Ne selectionner que les passagers
	- Décocher tous les opérateurs
    - Séléctionner les opérateurs : Karos, Ecov 
	- Passer a l'étape suivante
- Rétribution
	- Rentrer une rétribution de 20 000 €
	- Mettre une date de début 03/08/2020 au 04/09/2020
	- mettre 10 trajets max
	
	- Verifier qu'il a Passager (Pour le Passager) et pas Conducteur dans le form des rétributions
	- Cocher Gratuit
    - vérifier que le bloque de champs manquant s'efface.
	- Passer à l'étape suivante
	
- Vérifier dans le texte
	- du lundi 03 Aout 2020 au jeudi 04 Septembre 2020
	- lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche
	- 20 000 €.
	- Gratuit pour les passagers.
	- aux opérateurs Ecov, Karos
	- des preuves de classe A ou B ou C
  - incités doivent être sur les axes suivants
	- De Vienne à Saint-Étienne	



	
		
