#!/bin/bash
# /opt/srz-crawl/backup.sh
# Run daily via cron: 0 3 * * * /opt/srz-crawl/backup.sh

BACKUP_DIR="/opt/srz-crawl/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/srz-crawl-$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

# Backup app code and .env (not venv)
tar -czf "$BACKUP_FILE" \
  --exclude='/opt/srz-crawl/venv' \
  --exclude='/opt/srz-crawl/logs' \
  --exclude='/opt/srz-crawl/backups' \
  /opt/srz-crawl/

echo "Backup created: $BACKUP_FILE"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +8 | xargs -r rm
echo "Old backups cleaned up"
