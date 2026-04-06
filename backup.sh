#!/bin/bash

# PoultryMitra Backup Script
# Run: ./backup.sh

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="poultrymitra_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "🗄️  Creating database backup..."

docker exec poultry-db pg_dump -U poultry -F c -b -f /backups/$BACKUP_NAME poultrytrymitra

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/*.sql | tail -n +8 | xargs -r rm
    echo "🧹 Old backups cleaned (keeping 7)"
else
    echo "❌ Backup failed!"
    exit 1
fi