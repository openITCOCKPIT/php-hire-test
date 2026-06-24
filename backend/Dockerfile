FROM php:8.3-apache

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
COPY src/ /var/www/html/

RUN docker-php-ext-install mysqli pdo pdo_mysql
RUN composer dump-autoload
RUN chown -R www-data:www-data /var/www/html
