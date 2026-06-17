# Implementation Log — #13 E-mail sending (optional)

**Issue:** [docs/issues/13-email-sending.md](../issues/13-email-sending.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
api/config/app.php                          # Debug transport (env-driven) + from
api/src/Controller/RecipesController.php     # POST /recipes/{id}/send-mail
api/templates/email/html/recipe.php          # HTML mail body
frontend/src/app/services/recipe.service.ts  # sendRecipeEmail(id, email)
frontend/src/app/components/recipe-detail/*   # "Share by e-mail" modal
+ backend & frontend tests
```

## Decisions made during implementation, and why

### 1. Debug transport, chosen with the user
The mail transport is a config decision (CLAUDE.md: ask before config changes), so
the approach was confirmed with the user: the **Debug transport** (default, env-
overridable via `EMAIL_TRANSPORT_DEFAULT_CLASS`) — it never contacts a mail
server, so the feature is verifiable in dev with zero setup. Only one env-driven
line changed in `app.php`; real SMTP is a `.env` switch for production.

### 2. CakePHP `Mailer` + an HTML template
`new Mailer('default')` with an HTML `templates/email/html/recipe.php` (title,
created date, ingredient list, description). All values are escaped with `h()`.
No third-party mail package — the framework's Mailer covers it.

### 3. Server-side e-mail validation is the boundary
`Validation::email()` rejects a bad address with a 422 JSON envelope (same shape
as the create form). The frontend also checks, but only as UX; the server is
authoritative. An unknown recipe id returns a JSON 404; neither error sends mail.

### 4. Explicit log line for dev verifiability
The Debug transport returns the message but does not write a file, and the
profile `'log' => true` did not reliably log here — rather than depend on opaque
framework behaviour, the controller logs one concise line via `Log::info()`
(`Recipe "…" e-mailed to …`) after a successful send, landing in
`logs/debug.log`. The reviewer can confirm a send without a mail server.

### 5. In-place modal, not a route
Sending is a transient flow (enter address, send, done), so it is a Bootstrap-
styled modal toggled by a signal — shown with Angular's control flow and a
backdrop, no Bootstrap JS needed. States: idle → sending (spinner, disabled) →
sent (success + Done) or error (inline message, server 422 message surfaced).

## Verification

```
curl POST /recipes/1/send-mail {"email":"friend@example.com"}  # {"sent":true}
curl … {"email":"not-an-email"}                                # 422, no mail
curl POST /recipes/9999/send-mail …                            # 404, no mail
logs/debug.log                                                 # 'Recipe "Chocolate cake" e-mailed to …'
vendor/bin/phpunit                                             # 35 tests green (EmailTrait: assertMailSentTo + assertMailContainsHtml)
ng test                                                        # 24 specs green (modal success + invalid-email)

Browser (Playwright): detail page → "Share by e-mail" → modal → enter address →
Send → "Recipe sent to friend@example.com."; server logged the send; 0 console errors.
```

## Notes

- This was the optional, first-to-drop feature; it is complete, so nothing was
  cut. **Epic D is done.** Remaining: #14 (UX polish + cross-browser core flows)
  and #15 (full browser test, README, PR).
