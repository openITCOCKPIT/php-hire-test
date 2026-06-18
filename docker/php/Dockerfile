# PHP-FPM 8.3 — pinned to the exact version the challenge requires (PHP >= 8.3),
# independent of whatever PHP version is installed on the host machine.
FROM php:8.3-fpm

# System libraries needed to build the PHP extensions CakePHP 5 relies on:
#   libicu-dev   -> intl
#   libonig-dev  -> mbstring
#   libzip-dev   -> zip (composer package extraction)
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libicu-dev \
        libonig-dev \
        libzip-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql intl mbstring zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer pulled from its official image (reproducible, no curl | sh).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html/api

# On start, apply migrations and seed demo data, then run php-fpm.
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
