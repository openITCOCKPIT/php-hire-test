# #13 — E-mail sending (Feature 3 — optional)

**Epic:** D — Advanced Features
**Feature reference:** Feature 3 (Send recipes via E-Mail to a friend — optional)
**Effort:** 1–2 h
**Dependencies:** #5
**Status:** ✅ done

## Goal

Expose `POST /recipes/{id}/send-mail` that sends a formatted HTML e-mail to a provided address, and add a UI modal dialog for entering the recipient address — completing the optional but listed "send to friend" feature.

## Description

**Backend:**
1. Add route:
   ```php
   $routes->post('/recipes/{id}/send-mail', ['controller' => 'Recipes', 'action' => 'sendMail']);
   ```
2. Implement `RecipesController::sendMail($id)`:
   - Load the recipe (404 if not found).
   - Read and validate `email` from the POST body (required, valid e-mail format).
   - Use CakePHP 5.x Mailer to send an HTML e-mail:
     ```php
     $mailer = new Mailer('default');
     $mailer->setTo($email)
            ->setSubject('Recipe: ' . $recipe->title)
            ->setEmailFormat('html')
            ->viewBuilder()->setTemplate('recipe');
     $mailer->set('recipe', $recipe);
     $mailer->send();
     ```
3. Create the e-mail HTML template at `templates/email/html/recipe.php`:
   - Recipe title (h2)
   - Created date
   - Ingredient list (ul)
   - Description
4. Return `{ "sent": true }` on success; `{ "errors": { "email": ["Invalid email address"] } }` on validation failure.
5. Configure the SMTP transport in `config/app_local.php` (or `.env`); for dev, use `debug` transport (logs to file instead of sending).

**Frontend:**
1. Add a "Send via E-Mail" button to the recipe detail page (#8) or recipe cards.
2. On click: open a Bootstrap modal with an e-mail input field and a Send button.
3. On submit: POST to `/recipes/{id}/send-mail`, show success message or inline error.
4. Close modal after success.

## Technical Notes

- CakePHP's `debug` transport writes mails to `logs/debug.log` — no SMTP server required for development. Configure in `.env`:
  ```
  EMAIL_TRANSPORT_DEFAULT_CLASS=Debug
  ```
- Production SMTP config: `EMAIL_TRANSPORT_DEFAULT_HOST`, `_PORT`, `_USERNAME`, `_PASSWORD` env vars.
- Validate the e-mail server-side with `Validator::email()` (CakePHP validation rule) — frontend validation is a UX enhancement only.
- The mailer template should be self-contained HTML (inline styles for e-mail client compatibility).

## Rationale / Decisions

**Why CakePHP Mailer instead of a third-party PHP mailer (PHPMailer, Symfony Mailer)?**
CakePHP's built-in Mailer class covers all required functionality (SMTP, HTML templates, debug transport) without adding a dependency. PHPMailer or Symfony Mailer would introduce additional packages and configuration — not justified for a feature that is explicitly optional and may be the first to drop if time runs short.

**Why the `debug` transport for development?**
A real SMTP server (even a local one like Mailhog or Mailtrap) requires additional Docker Compose services, which adds setup complexity for the reviewer. The `debug` transport writes the mail to a log file, which is verifiable (the reviewer can open `logs/debug.log`) without needing any external service. Noted in the README so the reviewer knows how to verify the feature.

**Why a Bootstrap modal for the e-mail dialog instead of a separate route (`/recipes/:id/send`)?**
An in-place modal keeps the user on the detail/list page — the send action is a transient flow (enter email, click send, done). A separate route would add routing complexity and navigation back-and-forth for a 2-field form. The modal is the appropriate UX pattern for short, interruptible tasks.

**Why return `{ "sent": true }` instead of HTTP 204 (No Content)?**
HTTP 204 is semantically correct for "action completed, no content to return". However, `{ "sent": true }` makes it easier for the Angular frontend to check success (`response.sent === true`) without only relying on the HTTP status code. This aligns with the "We love JSON" hint and the project's JSON-first API convention.

**This is the first feature to drop if time runs short.**
Reasoning: it is explicitly labelled "optional" in the original task, it requires dev SMTP configuration (more setup), and it does not affect any of the required features. All other issues build on each other; this one is a self-contained add-on.

## Definition of Done

- [x] `POST /recipes/1/send-mail` with a valid address logs the delivery to `logs/debug.log`
- [x] `POST /recipes/1/send-mail` with `{"email":"not-an-email"}` returns HTTP 422 with error
- [x] `POST /recipes/9999/send-mail` returns HTTP 404
- [x] Angular UI: "Share by e-mail" button opens a modal with an e-mail input
- [x] Submitting the modal shows a success confirmation
- [x] Invalid e-mail in the modal shows an inline error message
- [x] E-mail template includes title, created date, ingredients list, and description

## Tests

- [x] **PHPUnit (EmailTrait):** `testSendMailDeliversToTheGivenAddress` asserts the mail goes to the **user-supplied** address with the recipe in the HTML body; `testSendMailInvalidEmailReturns422`; `testSendMailUnknownRecipeReturns404` (neither sends mail).
- [x] **Jasmine/Karma:** modal success flow POSTs `{email}` and shows success; an invalid address shows an inline error and does **not** POST; service `sendRecipeEmail` test.

**Verification (2026-06-18):** 35 backend + 24 frontend tests green; browser-verified
the full modal flow; the send was logged to `logs/debug.log`. **Epic D complete.**
