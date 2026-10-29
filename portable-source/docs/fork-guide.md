# Fork and adoption guide

## For public, generic contributions

1. Open the public organization repository and choose **Fork**.
2. Select an organization where you have permission to create repositories.
3. Clone your fork, create a topic branch, and keep changes generic and non-confidential.
4. Run `pnpm install --frozen-lockfile`, `pnpm run validate:catalog`, and `pnpm test`.
5. Open a pull request to the upstream repository with the public source citation, interpretation status, tests, and reviewer notes.
6. Wait for the configured CI checks and human reviewers; do not assume a green check approves legal meaning.

## For a financial institution's private implementation

GitHub documents that forks of public repositories are public and cannot be made private independently. See [About forks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks). Do **not** add bank-specific mappings, policies, data, identifiers, credentials, approvals, or operational controls to a public fork.

Instead, follow the institution's approved process to create a private internal repository from a reviewed upstream release or source package. Record the upstream URL, tag/commit, and import date in an internal provenance note. Synchronize generic improvements through reviewed cherry-picks or a controlled vendor-update process. Keep local implementation and evidence inside institution-controlled systems.

## After the package is in your repository

1. Preserve the organization's approved root `LICENSE` and required notices.
2. Replace example `CODEOWNERS` entries with real legal/compliance and engineering reviewer teams.
3. Protect the default branch; require pull requests and the catalog CI status check.
4. Review whether fork-origin workflows may run under organization policy. The supplied workflow needs only read permission and no secrets.
5. Confirm the selected source versions, legal interpretation, business-day calendar, mapping, and tests with accountable owners.
6. Add institution-specific controls privately; do not present the generic demo as production-ready.

GitHub's `pull_request` workflow runs are restricted for fork contributions: the token is read-only, repository secrets are withheld, and organization policy may require maintainer approval. See [Events that trigger workflows](https://docs.github.com/actions/learn-github-actions/events-that-trigger-workflows) and [Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository).

This repository does not connect to GitHub or create, fork, push, merge, or deploy a repository for you.
