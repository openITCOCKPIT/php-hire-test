# Recipe Collection

A small full-stack application for the AVENDIS coding challenge: browse, create,
search, sort and preview recipes, and optionally send a recipe by e-mail.

**Stack:** CakePHP 5 (JSON REST API) · Angular + TypeScript · Bootstrap 5 ·
MySQL 8.0 · PHP 8.3 · nginx + PHP-FPM

> The work is broken into self-contained issues under
> [`docs/issues/`](docs/issues/README.md), each documenting the reasoning behind
> its technical decisions.

---

## Setup

The recommended path is **Docker Compose** — it provisions the exact required
versions (PHP 8.3, MySQL 8.0, nginx) and runs identically on any machine,
including the Ubuntu 26.04 target. A native Ubuntu setup is documented below as
the production-equivalent alternative.

### Option A — Docker Compose (recommended)

```bash
# 1. Provide environment variables (credentials, ports)
cp .env.example .env

# 2. Build and start nginx + PHP-FPM 8.3 + MySQL 8.0
docker compose up -d --build

# 3. Verify the stack (nginx -> PHP-FPM -> MySQL)
curl http://localhost:8765
```

The API is served at `http://localhost:8765`. MySQL listens on `localhost:3306`.
Stop everything with `docker compose down` (add `-v` to also drop the database
volume).

### Option B — Ubuntu 26.04 LTS (native, production-like)

The deployment target is an Ubuntu 26.04 VM with nginx + PHP-FPM. The numbered
commands below install the full stack natively:

```bash
# 1.  System packages up to date
sudo apt update && sudo apt upgrade -y

# 2.  Tooling for adding PHP repositories
sudo apt install -y software-properties-common

# 3.  PHP 8.3 repository
sudo add-apt-repository ppa:ondrej/php -y && sudo apt update

# 4.  PHP 8.3 + the extensions CakePHP 5 needs
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring \
    php8.3-intl php8.3-xml php8.3-curl php8.3-zip

# 5.  nginx web server
sudo apt install -y nginx

# 6.  MySQL 8.0 server
sudo apt install -y mysql-server-8.0

# 7.  Enable and start the services
sudo systemctl enable --now php8.3-fpm nginx mysql

# 8.  Backend dependencies (run inside ./api once the skeleton exists, issue #2)
#     composer install

# 9.  Fallback dev server if you don't want to configure an nginx vhost:
#     cd api && bin/cake server -p 8765

# 10. Node.js 22 for the Angular frontend (issue #3)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# 11. Install Node.js
sudo apt install -y nodejs

# 12. Angular CLI
sudo npm install -g @angular/cli
```

---

## Architecture

Key decisions are summarised here and explained in full in the relevant issue
under [`docs/issues/`](docs/issues/README.md). This section grows as features land.

- **CakePHP 5 over plain PHP.** The task allows either. CakePHP provides routing,
  an ORM, validation and JSON serialisation out of the box, and — decisively — it
  is the framework openITCOCKPIT itself is built on, so it mirrors the real stack.
  Plain PHP would mean re-implementing that infrastructure by hand.
- **Docker Compose for development.** Reproducible and version-exact; the same
  containers run on any reviewer's machine. The native Ubuntu path above documents
  the production-equivalent nginx + PHP-FPM setup the deployment target uses.
- **JSON REST API + Angular SPA.** A clean separation: CakePHP speaks only JSON
  ("we love JSON"), Angular owns the UI.

_To be expanded: data model (DECIMAL vs FLOAT, VARCHAR vs ENUM), server-side
sort/search, RxJS hover preview, and the Symfony → CakePHP framework note._

---

## Browser support

Target browsers (verified before submission): **Firefox**, **Chrome**,
**Microsoft Edge**.

_Verification matrix to be completed in issues #12, #14 and #15._

---

## License

[MIT](LICENSE)

---

<details>
<summary>Original challenge brief (AVENDIS)</summary>

Create a recipe collection where a user can browse existing recipes or create a
new one. Recipes can be sent by e-mail to a given address. Use plain PHP or
CakePHP, plus TypeScript and Angular.

**Features:** (1) browse recipes, (2) create recipes with ingredients,
(3) send a recipe by e-mail (optional), (4) sort the list, (5) search recipes,
(6) load a recipe preview via AJAX on hover of the title, (7) make it user
friendly.

**Requirements:** PHP >= 8.3 · MySQL >= 8.0 · Bootstrap 5.x · TypeScript and
Angular · HTML5 · supported browsers Firefox, Chrome, Microsoft Edge.

**Workflow:** fork the repository, create a branch named after your GitHub
username, and open a pull request when done. License: MIT.

</details>
