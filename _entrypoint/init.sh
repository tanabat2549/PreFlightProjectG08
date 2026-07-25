#!/bin/bash    //บอก script ว่าจะรันด้วย bash 
set -e ##เป็นการกำหนดว่าหากบรรทัดไหนผิดพลาดจะให้หยุดการทำงานทันที

echo "---------------------------------------------"
echo "Setting up PostgreSQL database: $POSTGRES_DB"
echo "Creating application user: $POSTGRES_APP_USER"
echo "---------------------------------------------"


##-v ON_ERROR_STOP=1 -> หากคำสั่ง SQL ภายในบล็อกเกิดข้อผิดพลาด ให้หยุดทำงานทันที
##--username "$POSTGRES_USER" -> เข้าใช้งานใน role superuser == admin
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"<<-EOSQL
    REVOKE CONNECT ON DATABASE $POSTGRES_DB FROM public;
    REVOKE ALL ON SCHEMA public FROM PUBLIC;
    CREATE USER $POSTGRES_APP_USER WITH PASSWORD '$POSTGRES_APP_PASSWORD';
    CREATE SCHEMA drizzle;
    GRANT ALL ON DATABASE $POSTGRES_DB TO $POSTGRES_APP_USER;
    GRANT ALL ON SCHEMA public TO $POSTGRES_APP_USER;
    GRANT ALL ON SCHEMA drizzle TO $POSTGRES_APP_USER;
EOSQL