# 🚀 Production Deployment Guide

## Modern Library Management System - Docker Production Setup

This guide will help you deploy the Modern Library Management System in a production environment using Docker with PostgreSQL database.

---

## 📋 Prerequisites

### System Requirements
- **Docker**: Version 20.10+ 
- **Docker Compose**: Version 2.0+
- **Hardware**: Minimum 2GB RAM, 10GB storage
- **OS**: Linux (Ubuntu 20.04+), macOS 10.15+, or Windows 10+

### Network Requirements
- **Ports**: 3000 (frontend), 3001 (backend), 5432 (PostgreSQL)
- **Internet**: Required for initial Docker image downloads

---

## 🔧 Quick Production Setup

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone https://github.com/ecetiner87/modern-library.git
cd modern-library

# Create production environment file
cp env.production.example .env.production

# Edit the environment file with your production values
nano .env.production
```

### 2. Configure Production Environment

Update `.env.production` with secure values:

```bash
# Database Configuration
DB_USER=your_db_user
DB_PASSWORD=your_secure_database_password
DB_NAME=modern_library_prod

# Security
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
BCRYPT_ROUNDS=12

# CORS (Update with your production domain)
CORS_ORIGIN=https://your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
```

### 3. Start Production Environment

```bash
# Load environment variables and start services
docker-compose --env-file .env.production up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify Deployment

```bash
# Check application health
curl http://localhost:3001/api/health
curl http://localhost:3000

# Check database connection
docker-compose exec backend npm run migrate

# View running containers
docker ps
```

---

## 📊 Migrating from Apache Derby Database

### Option 1: CSV Export/Import (Recommended)

#### Step 1: Export Data from Derby

In your existing Derby database, run these SQL commands:

```sql
-- Export Authors
CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'AUTHORS', 'authors.csv', null, null, null);

-- Export Categories  
CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'CATEGORIES', 'categories.csv', null, null, null);

-- Export Books
CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'BOOKS', 'books.csv', null, null, null);

-- Export Reading History (if exists)
CALL SYSCS_UTIL.SYSCS_EXPORT_TABLE(null, 'READING_HISTORY', 'reading_history.csv', null, null, null);
```

#### Step 2: Prepare Migration Data

```bash
# Create migration directory
mkdir -p migration-data

# Copy your exported CSV files to migration-data/
cp /path/to/your/derby/exports/*.csv migration-data/

# Ensure CSV headers match expected format
head -n 1 migration-data/books.csv
# Expected: id,title,author_name,category_name,isbn,pages,publication_date,description,is_read,rating,language,date_added
```

#### Step 3: Run Migration

```bash
# Start the PostgreSQL database
docker-compose up -d postgres

# Wait for database to be ready
docker-compose exec postgres pg_isready -U postgres

# Run the migration script
docker-compose exec backend npm run migrate:derby

# Follow the prompts and select option 1 (CSV Migration)
```

### Option 2: Manual CSV Creation

If you have trouble with Derby export, create CSV files manually:

#### Books CSV Format (`migration-data/books.csv`):
```csv
id,title,author_name,category_name,isbn,pages,publication_date,description,is_read,rating,language,date_added
1,"Book Title","Author Name","Category Name","9781234567890",250,"2023-01-01","Book description",true,5,"English","2023-01-01"
```

#### Authors CSV Format (`migration-data/authors.csv`):
```csv
id,name,biography,nationality,birth_date,death_date
1,"Author Name","Author biography","Country","1900-01-01",null
```

#### Categories CSV Format (`migration-data/categories.csv`):
```csv
id,name,description,color
1,"Fiction","Fiction books","#3B82F6"
```

### Option 3: JSON Export

Create a JSON file with your data:

```json
{
  "authors": [
    {"id": 1, "name": "Author Name", "biography": "Bio", "nationality": "Country"}
  ],
  "categories": [
    {"id": 1, "name": "Category Name", "description": "Description", "color": "#3B82F6"}
  ],
  "books": [
    {
      "id": 1,
      "title": "Book Title",
      "author_name": "Author Name",
      "category_name": "Category Name",
      "isbn": "9781234567890",
      "pages": 250,
      "publication_date": "2023-01-01",
      "description": "Description",
      "is_read": true,
      "rating": 5,
      "language": "English",
      "date_added": "2023-01-01"
    }
  ]
}
```

Save as `migration-data/derby-export.json` and run migration with option 2.

---

## 🔒 Production Security Checklist

### Environment Security
- [ ] Strong database passwords (minimum 16 characters)
- [ ] Secure JWT secret (minimum 32 characters)
- [ ] CORS properly configured for your domain
- [ ] Environment files not committed to Git

### Container Security
- [ ] Services running as non-root users
- [ ] Resource limits configured
- [ ] Health checks enabled
- [ ] Restart policies set to `unless-stopped`

### Network Security
- [ ] Use reverse proxy (nginx/Traefik) for HTTPS
- [ ] Firewall configured to block unnecessary ports
- [ ] Database not exposed to public internet
- [ ] Rate limiting enabled

### Data Security
- [ ] Regular database backups enabled
- [ ] Backup integrity verification
- [ ] Backup retention policy configured
- [ ] File upload restrictions in place

---

## 📈 Monitoring and Maintenance

### Health Monitoring

```bash
# Check service health
docker-compose exec backend curl -f http://localhost:3001/api/health
docker-compose exec frontend curl -f http://localhost:3000

# View resource usage
docker stats

# Check logs
docker-compose logs -f --tail=100 backend
docker-compose logs -f --tail=100 frontend
docker-compose logs -f --tail=100 postgres
```

### Database Maintenance

```bash
# Manual backup
docker-compose exec postgres pg_dump -U postgres modern_library > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres modern_library < backup.sql

# Database statistics
docker-compose exec postgres psql -U postgres -d modern_library -c "\\dt+"
```

### Log Management

```bash
# Rotate Docker logs
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"5"}}' > /etc/docker/daemon.json
systemctl restart docker

# View application logs
tail -f logs/application.log
```

---

## 🔄 Updates and Scaling

### Application Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
docker-compose build --no-cache
docker-compose up -d

# Run any new migrations
docker-compose exec backend npm run migrate
```

### Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Use load balancer (nginx example)
upstream backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}
```

### Database Scaling

For high-traffic scenarios, consider:
- Read replicas for PostgreSQL
- Connection pooling (PgBouncer)
- Redis caching layer
- Database optimization and indexing

---

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run migrate
```

#### Migration Problems
```bash
# Check migration status
docker-compose exec backend npm run migrate:status

# Reset and re-run migrations
docker-compose exec backend npm run migrate:rollback
docker-compose exec backend npm run migrate
```

#### Frontend Not Loading
```bash
# Check if backend is accessible
curl http://localhost:3001/api/health

# Rebuild frontend with correct API URL
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check database performance
docker-compose exec postgres psql -U postgres -d modern_library -c "SELECT * FROM pg_stat_activity;"

# Optimize database
docker-compose exec postgres psql -U postgres -d modern_library -c "VACUUM ANALYZE;"
```

### Getting Help

1. Check application logs: `docker-compose logs -f`
2. Verify environment configuration: `cat .env.production`
3. Test database connectivity: `docker-compose exec backend npm run migrate:status`
4. Check GitHub issues: [https://github.com/ecetiner87/modern-library/issues](https://github.com/ecetiner87/modern-library/issues)

---

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)

---

**🎉 Congratulations!** Your Modern Library Management System is now running in production with Docker and PostgreSQL! 