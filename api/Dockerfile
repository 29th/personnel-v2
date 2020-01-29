FROM php:7.4.1-apache

# Install composer (and fix package manager per https://superuser.com/a/1423685)
# RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://security.debian.org jessie/updates main\ndeb-src http://security.debian.org jessie/updates main" > /etc/apt/sources.list \
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libzip-dev \
    zlib1g-dev \
  && docker-php-ext-install zip
RUN curl --silent --show-error https://getcomposer.org/download/1.8.6/composer.phar > /usr/local/bin/composer \
  && chmod 755 /usr/local/bin/composer

# Configure apache
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
  && a2enmod rewrite

# Configure php.ini
RUN echo "date.timezone = \"America/New_York\"" > "$PHP_INI_DIR/conf.d/docker.ini"

# Enable php mysql extension
RUN docker-php-ext-install mysqli

# Copy application files
COPY . /var/www/html
WORKDIR /var/www/html

# Install application dependencies
RUN composer install --no-plugins --no-scripts
