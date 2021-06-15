---
name: 🚀 Checklist de release
about: Checklist avant décollage
---

Pour déployer en production, je dois valider les points suivants.

## Points à valider avant la release

- [ ] code freeze
- [ ] mise à jour de la doc
- [ ] mise à jour du changelog
- [ ] fusion de toutes les PR concernées
- [ ] passer TOUS les tests automatisés
- [ ] passer TOUS les tests manuels avec le/la PO
- [ ] passer TOUTES les vérifs de la PR
- [ ] choix du numéro de release (format semver `vX.X.X`)

## Création de la release

1. Ajouter un tag `git tag vX.X.X`
2. Créer une branche à partir de ce tag `git checkout -b release/vX.X.X`
3. Déployer la branche sur Scalingo
