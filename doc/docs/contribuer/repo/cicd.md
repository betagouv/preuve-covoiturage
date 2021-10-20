# CI/CD

## Branches

The main branch of the project is `dev`.
Branches or created from the `dev` branch with this naming pattern : `<type>/<issue-id>-<name>`

| type        | branch from      | example               |
| ----------- | ---------------- | --------------------- |
| new feature | `dev`            | `feat/1234-coolstuff` |
| bugfix      | `dev`            | `fix/1234-fixme`      |
| hotfix      | `release/vX.X.X` | `hotfix/1234-burning` |

Push to git and create a PR (draft if not ready yet)

```shell
git push -u origin <branch-name>
```

Working on an old branch (couple of days) ? Please rebase `origin/dev` to make sure your code is up to date.

```shell
git fetch
git rebase origin/dev
git push -f # you've been rewriting the history on your branch
```

## Issues

## Pull-requests

Please write a comprehensive description of the content. Use checkboxes when several tickets or steps are included in the same PR.
Be nice to the testers and guide them with the steps needed to reproduce/test the features. This can be a simple bullet-point list.

Keep PR small and simple to understand for the reviewers to avoid having them pending for a long time and getting stale.

When a couple of tickets are needed to complete a PR, create it as Draft and take some time explain what it is going to do. Write down the steps and check them when done.
When you're ready, click the "Ready for review" and share the PR link in Mattermost with the reviewers to make sure they don't miss the notification.

Once merged, move the tickets to the "to test" column of the Kanban and ping the PO for tests and feedback.

### Release pull-requests

Please use the template for release pull requests and make sure all checkboxes are checked.

## Deployments

### Development

**dev** environment runs on Kubernetes. **Every commit** to the `dev` branch triggers an image build and a deployment PR on the [infra repository](https://github.com/betagouv/preuve-covoiturage-infra/pulls).
When you merge this PR, the Terraform configuration of the cluster changes. [ArgoCD](https://cd.dev.covoiturage.beta.gouv.fr/) checks this repo every 5 minutes and deploys on changes.

You can trigger a sync in ArgoCD manually.

### Demo

**demo** environment runs on Kubernetes too. Deployments use the same process as _dev_ but they are triggered when a **tag** with the pattern `vX.X.X` is created.

### Production

**production** runs on Scalingo. The PaaS doesn't support tag deployment. It is then required to create a branch from this tag with the naming pattern : `release/vX.X.X`.

::: tip
type the name in the _branch or tag_ field and Github will ask you to create a new one.
:::

On Scalingo, [create a new manual deploy from your branch](https://dashboard.scalingo.com/apps/osc-fr1/pdc-prod/deploy/manual). The build and migrations are run before deploying.
