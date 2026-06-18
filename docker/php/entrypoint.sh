#!/bin/sh
# Container start-up for the API: ensure dependencies, apply the schema and seed
# demo data, then run the given command (php-fpm).
set -e
cd /var/www/html/api

# First run on a fresh checkout (no vendor/): install dependencies.
if [ ! -f vendor/autoload.php ]; then
    echo "Installing PHP dependencies…"
    composer install --no-interaction --no-progress
fi

# Wait for the database, then apply migrations. Migrations only apply pending
# changes, so this is safe on every start.
tries=0
until php bin/cake.php migrations migrate; do
    tries=$((tries + 1))
    if [ "$tries" -ge 30 ]; then
        echo "Database still not reachable after 30 attempts; starting anyway." >&2
        break
    fi
    echo "Waiting for the database… ($tries)"
    sleep 2
done

# Seed demo recipes. The seeder is tracked in cake_seeds, so it runs once on a
# fresh database and never overwrites recipes created later through the UI.
php bin/cake.php seeds run RecipesSeed || true

exec "$@"
