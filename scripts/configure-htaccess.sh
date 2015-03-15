echo 'Configuring .htaccess'
sed -i "s/DB_DEFAULT_USERNAME '.*'/DB_DEFAULT_USERNAME '$USERNAME'/g" .htaccess
sed -i "s/DB_DEFAULT_HOSTNAME '.*'/DB_DEFAULT_HOSTNAME '$HOSTNAME'/g" .htaccess
sed -i "s/DB_FORUMS_USERNAME '.*'/DB_FORUMS_USERNAME '$USERNAME'/g" .htaccess
sed -i "s/DB_FORUMS_HOSTNAME '.*'/DB_FORUMS_HOSTNAME '$HOSTNAME'/g" .htaccess