#!/bin/bash

# PoultryMitra Restore Script
# Usage: ./restore.sh backup_file.sql

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh backup_file.sql"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.sql 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ File not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  This will restore database from: $BACKUP_FILE"
echo "⚠️  Current data will be REPLACED!"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 1
fi

echo "🗄️  Restoring database..."

docker exec -i poultry-db pg_restore -U poultry -d poultrytrymitra -c < $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi