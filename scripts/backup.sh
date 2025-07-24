#!/bin/bash

# PostgreSQL Backup Script for Modern Library Management System
# This script creates daily backups and maintains retention policy

set -e

# Configuration
BACKUP_DIR="/backups"
DB_HOST=${PGHOST:-postgres}
DB_PORT=${PGPORT:-5432}
DB_NAME=${PGDATABASE:-modern_library}
DB_USER=${PGUSER:-postgres}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/modern_library_backup_$TIMESTAMP.sql"
BACKUP_COMPRESSED="$BACKUP_FILE.gz"

echo "Starting backup of database '$DB_NAME' at $(date)"

# Create SQL dump
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-password > "$BACKUP_FILE"; then
    echo "Database backup created: $BACKUP_FILE"
    
    # Compress the backup
    if gzip "$BACKUP_FILE"; then
        echo "Backup compressed: $BACKUP_COMPRESSED"
        
        # Verify backup integrity
        if gunzip -t "$BACKUP_COMPRESSED"; then
            echo "Backup integrity verified"
        else
            echo "ERROR: Backup corruption detected!"
            exit 1
        fi
    else
        echo "WARNING: Backup compression failed"
    fi
else
    echo "ERROR: Database backup failed!"
    exit 1
fi

# Clean up old backups (keep only last N days)
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "modern_library_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "modern_library_backup_*.sql" -mtime +$RETENTION_DAYS -delete

# List current backups
echo "Current backups:"
ls -lah "$BACKUP_DIR"/modern_library_backup_*

echo "Backup completed successfully at $(date)" 