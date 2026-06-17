#!/bin/sh

set -e

if [ -f composer.json ] && [ ! -d vendor ]; then
    echo "Installing composer dependencies..."
    composer install --no-interaction --optimize-autoloader
fi

echo "Running migrations..."
bin/cake migrations migrate || echo "Migrations failed or already up to date."

echo "Database is ready (Checked by Docker Compose Healthcheck). Starting PHP-FPM..."
exec "$@"