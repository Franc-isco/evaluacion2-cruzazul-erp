#!/bin/bash

FECHA=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/tmp"
BACKUP_FILE="cruzazuldb_backup_$FECHA.sql"
S3_BUCKET="s3://cruz-azul-backups-eva3"

export PGPASSWORD="$DB_PASSWORD"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "$S3_BUCKET/$BACKUP_FILE"

rm "$BACKUP_DIR/$BACKUP_FILE"
