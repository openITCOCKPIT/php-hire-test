# Implementation Log

This folder documents **how each issue was actually implemented** and the
reasoning that emerged *during* the work — including decisions made on the fly,
alternatives that were rejected, and deviations from the original plan.

It complements, but is distinct from, [`docs/issues/`](../issues/README.md):

| Folder | Purpose | Written |
|---|---|---|
| `docs/issues/` | The **plan / spec** — what to build and the up-front rationale | before implementation |
| `docs/implementation/` | The **build log** — what was built, why, and what changed | during/after implementation |

The reviewer can read an issue spec to see the intent, then the matching
implementation log to see how it played out in practice.

## Logs

| # | Issue | Log |
|---|---|---|
| #1 | Repository & development environment | [01-repository-setup.md](01-repository-setup.md) |
| #2 | CakePHP skeleton & `/status` endpoint | [02-cakephp-skeleton.md](02-cakephp-skeleton.md) |
| #3 | Angular project, Bootstrap 5, CORS slice | [03-angular-project.md](03-angular-project.md) |
| #4 | Database schema, migrations & seed | [04-database-schema.md](04-database-schema.md) |
| #5 | Recipe read API (list & detail) | [05-recipe-read-api.md](05-recipe-read-api.md) |
| #6 | Recipe write API (create + validation) | [06-recipe-write-api.md](06-recipe-write-api.md) |
| #7 | RecipeService & recipe list (MVP) | [07-recipe-list-component.md](07-recipe-list-component.md) |
| #8 | Detail view (+ CORS-on-error fix) | [08-recipe-detail-view.md](08-recipe-detail-view.md) |
| #9 | Create recipe form (Epic C complete) | [09-create-recipe-form.md](09-create-recipe-form.md) |
| #10 | Sorting (server-side, whitelisted) | [10-sorting.md](10-sorting.md) |
| #11 | Search (debounced, server-side LIKE) | [11-search.md](11-search.md) |
| #12 | AJAX hover preview (centrepiece) | [12-hover-preview.md](12-hover-preview.md) |
| #13 | E-mail sending (optional) | [13-email-sending.md](13-email-sending.md) |
