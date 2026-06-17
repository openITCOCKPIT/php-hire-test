# #1 — Set up repository & development environment

**Epic:** A — Project Setup & Infrastructure
**Feature reference:** —
**Effort:** 1–2 h
**Dependencies:** none
**Status:** ⬜ open

## Goal

Fork the upstream repository, create the `Psheikomaniac` branch, and establish a working local development environment so that every subsequent issue has a stable base to build on.

## Description

1. Fork `openITCOCKPIT/php-hire-test` on GitHub into the personal account `Psheikomaniac`.
2. Clone the fork locally and create branch `Psheikomaniac` off `master`.
3. Set up the development environment — either Docker Compose (nginx + PHP-FPM 8.3 + MySQL 8.0) or direct Ubuntu VM setup (see Technical Notes).
4. Create the project README skeleton with empty sections: **Setup**, **Architecture**, **Browser support**.
5. Add a numbered Ubuntu 26.04 setup command list to the README (see Technical Notes for the exact commands expected).
6. Push the skeleton commit to the remote branch and confirm the environment starts.

The README scaffold ensures architecture decisions and Ubuntu affinity are visible from the very first commit — this matters because the reviewer judges commitment history, not just the final result.

## Technical Notes

**Ubuntu 26.04 LTS numbered setup block** (to appear verbatim in the README under "Setup"):

```
1.  sudo apt update && sudo apt upgrade -y
2.  sudo apt install -y software-properties-common
3.  sudo add-apt-repository ppa:ondrej/php -y && sudo apt update
4.  sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring \
        php8.3-intl php8.3-xml php8.3-curl php8.3-zip
5.  sudo apt install -y nginx
6.  sudo apt install -y mysql-server-8.0
7.  sudo systemctl enable --now php8.3-fpm nginx mysql
8.  composer create-project cakephp/app:^5 api --prefer-dist
9.  cd api && bin/cake server -p 8765   # fallback dev-server
10. curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
11. sudo apt install -y nodejs
12. npm install -g @angular/cli
```

**Docker Compose** is an equally valid alternative (see Rationale below) and is the recommended path for reproducibility; include a `docker-compose.yml` if the VM approach is not used.

**Fallback dev-server:** `bin/cake server -p 8765` is explicitly allowed and avoids nginx config complexity during development. nginx + PHP-FPM should still be documented for the reviewer (shows production awareness).

## Rationale / Decisions

**Why CakePHP 5.x instead of plain PHP?**
The task says "plain PHP *or* CakePHP". Plain PHP would require hand-rolling routing, an ORM, input validation, and JSON serialisation — all things CakePHP provides out of the box. More importantly, openITCOCKPIT itself is built on CakePHP, so choosing it demonstrates direct relevance to the team's daily work. Plain PHP was rejected because it would cost 5–8 additional hours to build equivalent infrastructure, time better spent on features.

**Why nginx + PHP-FPM instead of Apache?**
The task hints say "Nginx and PHP-FPM" under "Nice to have". Using nginx aligns with AVENDIS's stated infrastructure preference (openITCOCKPIT runs on nginx). Apache would have been simpler to configure locally but would not signal environment familiarity.

**Why Docker Compose as the primary environment?**
Docker Compose makes the environment fully reproducible on any reviewer's machine in a single `docker compose up` command. A raw Ubuntu VM requires the reviewer to provision a VM themselves. The trade-off is that Docker adds a dependency and masks "real" OS-level config — which is why the Ubuntu numbered-command list is documented in the README alongside it, showing both competencies.

**Why document the setup in the README from commit #1?**
The AVENDIS team uses GitHub + Jenkins; a well-structured README is the entry point for any new contributor. Starting it in issue #1 (rather than #15) means every commit builds on a real project structure and decision log from the beginning.

**Alternative considered:** Using the CakePHP dev server exclusively (no nginx at all). Rejected because it hides production concerns; nginx config is a 30-minute investment worth making.

## Definition of Done

- [ ] Fork exists at `github.com/Psheikomaniac/php-hire-test`
- [ ] Branch `Psheikomaniac` is pushed to the fork
- [ ] `docker compose up` (or Ubuntu VM setup) starts nginx, PHP-FPM 8.3, and MySQL 8.0 without errors
- [ ] Empty CakePHP app responds with an HTTP 200 at the configured URL
- [ ] `README.md` contains skeleton sections: Setup, Architecture, Browser support
- [ ] README includes the numbered Ubuntu 26.04 setup command list
- [ ] All committed, pushed, CI green (if applicable)
