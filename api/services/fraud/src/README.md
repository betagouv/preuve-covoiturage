# Fonctionnement

Le coeur métier se trouve dans src/engine. Chaque règle est une classe qui :
- expose une clé d'identification (souvent un slug) ;
- implémente une fonction handle comme: async (acquisition_id, meta) => [karma, meta] ;
- peut avoir une fonction d'initialisation ;

Pour simplifier, les règles qui itère sur un objet simple sont implémentée comme suit :
- a une clé "view" qui contient le nom de la vue sur laquelle itérer ;
- a une clé "viewDefinition" qui contient le code SQL créant la vue - avec une clé acquisition_id obligatoire ;
- peut avoir une fonction "cursor", qui va recevoir une ligne de la vue et les meta comme : async(row, meta) => [karma, meta] ;

## Actions

- appliquer les règles sur une acquisition_id: liste les règles applicables et non appliquée, puis applique l'action suivante 'appliquer une règle sur un acquisition_id' ;
- appliquer une règle sur un acquisition_id: 
  - cherche la règle grace à sa clé ;
  - initialize la règle ;
  - trouve ou crée l'enregistrement pour la règle en question (fraudcheck) ;
  - lance la fonction handle avec les meta + acquisition_id ;
  - sauvegarde le résultat.
- appliquer une règle sur un ensemble d'id: lance successivement l'action précédente 'appliquer une règle sur un acquisition_id' > optim via cursor à faire;
- lister les résultats pour un acquisition_id

