FROM php:7.4.1-apache

# Install composer (and fix package manager per https://superuser.com/a/1423685)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libzip-dev \
    zlib1g-dev \
    # for gd
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install \
    zip \
    gd \
  # cleanup
  && rm -rf \
      /var/lib/apt/lists/* \
      /usr/src/php/ext/* \
      /tmp/*

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

# Create coats public directory
RUN mkdir -p coats && chmod -R 777 coats

# Install application dependencies
RUN composer install --no-plugins --no-scripts
