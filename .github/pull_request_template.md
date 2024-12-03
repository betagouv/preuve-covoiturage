#fixes (issues)

## Description

<!-- compléter ici -->

## Checklist

- [ ] [j'ai suivi les guidelines du "clean code"](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29)
- [ ] [j'ai mis à jour la documentation technique](https://www.notion.so/Documentation-technique-du-Registre-de-preuve-de-covoiturage-14b994bec93180f98a89da28aff88f32)
- [ ] ajout ou mise à jour des tests unitaires
- [ ] ajout ou mise à jour des tests d'intégration

## Merge

Je squash la PR et vérifie que le message de commit utilise [la convention d'Angular](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format) :

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: proxy|acquisition|export|...
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```
Types de commit

 - build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
 - ci: Changes to our CI configuration files and scripts (examples: Github Actions)
 - docs: Documentation only changes
 - feat: A new feature (Minor bump)
 - fix: A bug fix (Patch bump)
 - perf: A code change that improves performance
 - refactor: A code change that neither fixes a bug nor adds a feature
 - test: Adding missing tests or correcting existing tests

Le _scope_ (optionnel) précise le module ou le composant impacté par le commit.
