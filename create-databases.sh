DIR_CWD=$1

echo 'Creating databases...'
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS personnel_v2"
mysql -uroot personnel_v2 < "${DIR_CWD}personnel_v2_sample.sql"

mysql -uroot -e "CREATE DATABASE IF NOT EXISTS vanilla"