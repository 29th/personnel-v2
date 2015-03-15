HOSTNAME=${1-localhost}
USERNAME=${2-root}

echo 'Creating databases...'
mysql -h ${HOSTNAME} -u${USERNAME} -e "CREATE DATABASE IF NOT EXISTS personnel_v2"
mysql -h ${HOSTNAME} -u${USERNAME} personnel_v2 < "${DIR_CWD}personnel_v2_sample.sql"

mysql -h ${HOSTNAME} -u${USERNAME} -e "CREATE DATABASE IF NOT EXISTS vanilla"