# Database Backup and Recovery Runbook

## 1. Prerequisites
- Production PostgreSQL database credentials (username, password, host, port).
- `pg_dump` and `pg_restore` utilities matching the PostgreSQL server version.
- Access to secure storage for backup files (e.g., AWS S3, Google Cloud Storage, or an encrypted local volume).

## 2. Backup Execution
### 2.1 Automated Backups
It is highly recommended to use your cloud provider's automated backup service (e.g., AWS RDS Automated Backups, Supabase Point-in-Time Recovery) rather than manual scripts.

### 2.2 Manual Logical Backup (pg_dump)
If performing a manual backup for migration or offsite storage:
```bash
# Execute this in a secure environment
export PGPASSWORD="<production_db_password>"
pg_dump -h <db_host> -p <db_port> -U <db_user> -F c -f ai_finance_db_backup_$(date +%F).dump <db_name>
unset PGPASSWORD
```
- `-F c`: Custom format (compressed, suitable for `pg_restore`).

## 3. Recovery Procedures
**WARNING:** Restoring a database overwrites existing data. Ensure application traffic is halted before beginning a restore to prevent split-brain data writes.

### 3.1 Point-in-Time Recovery (Provider Managed)
Follow the provider's documentation to restore the instance to the specified time. This usually creates a *new* database instance. You must then update the application's `DATABASE_URL` environment variable to point to the new instance.

### 3.2 Manual Restore (pg_restore)
```bash
# Stop the application workers to prevent incoming transactions
# Drop the existing database (if safe) or restore to a new database
export PGPASSWORD="<production_db_password>"
pg_restore -h <db_host> -p <db_port> -U <db_user> -d <db_name> -1 ai_finance_db_backup.dump
unset PGPASSWORD
```
- `-1`: Execute the restore as a single transaction (all or nothing).

## 4. Verification and Limitations
- **Verification**: Do not assume a backup command's exit code of `0` means the backup is valid. Periodically restore the backup to an isolated staging environment and run the backend test suite against it.
- **Limitations**: Logical backups do not capture Point-in-Time state between daily/hourly backups. Financial transactions occurring after the backup and before the crash will be lost. Always prefer Provider-managed WAL archiving for financial data.
