#!/bin/bash

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/backups"
BUCKET="cruz-azul-backups-eva4"
DB_CONTAINER="cruz_azul_postgres"
DB_NAME="cruzazuldb"
DB_USER="postgres"

mkdir -p $BACKUP_DIR

docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_cruzazul_$FECHA.sql

aws s3 cp $BACKUP_DIR/backup_cruzazul_$FECHA.sql s3://$BUCKET/

echo "Backup generado y enviado a S3: backup_cruzazul_$FECHA.sql"
