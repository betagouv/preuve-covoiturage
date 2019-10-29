## Tests d'intégration et end2end pour le front du Registre de Preuve de Covoiturage

### Organisation

- fixtures : remplace les générateurs pour données > 80kb
- integration : tests cypress lancés par les commandes cypress
- support/expectedApiPayload : valeurs envoyées/récupérées à/via l'api
- support/generators : generateur de valeurs pour les stubs
- support/reusables : tests cypress réutilisable, chaque test devrait pouvoir être appelé indépendamment
- support/stories : parcours utilisateurs complets
- support/stubs : retours des requêtes à l'api mockés pour les tests d'intégration
