FROM tutum/lamp:latest

# Install cURL
RUN apt-get update && apt-get -y install curl

# Install application
RUN rm -rf app && git clone -b docker https://github.com/29th/personnel-api.git /app

# Set environment variables
ENV ENVIRONMENT 'development'
ENV DB_DEFAULT_DATABASE 'personnel_v2'
ENV DB_DEFAULT_HOSTNAME 'localhost'
ENV DB_DEFAULT_USERNAME 'root'
ENV DB_DEFAULT_PASSWORD ''
ENV DB_DEFAULT_PORT '3306'
ENV ENCRYPTION_KEY 'abcdef' # how can this be random
ENV VANILLA_COOKIE_NAME 'Vanilla'
ENV VANILLA_COOKIE_DOMAIN ''
ENV VANILLA_COOKIE_PATH '/'
ENV VANILLA_COOKIE_HASH_METHOD 'md5'
ENV VANILLA_COOKIE_SALT '12345'


# Run server
EXPOSE 80 3306
CMD ["/run.sh"]

# Install composer
RUN curl -sS https://getcomposer.org/installer | php
RUN mv composer.phar /usr/local/bin/composer
RUN composer install -d /app

# Create MySQL database
#RUN mysql -u root -e "create database '${DB_DEFAULT_DATABASE}'"