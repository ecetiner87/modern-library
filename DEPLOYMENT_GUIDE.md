# 🚀 Deployment Guide - Modern Library Management System

This guide covers various deployment options for the Modern Library Management System.

## 📋 Table of Contents
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migration](#database-migration)

---

## 🛠️ Development Setup

### Local Development (Recommended for Testing)

1. **Clone and Setup**
   ```bash
   git clone https://github.com/ecetiner87/modern-library.git
   cd modern-library
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Database Setup**
   ```bash
   cp env.example .env
   npm run migrate
   npm run seed
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   npm start
   
   # Terminal 2: Frontend
   cd frontend && npm start
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

---

## 🏭 Production Deployment

### Option 1: Manual Production Deployment

#### Backend Production Setup

1. **Server Setup**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm postgresql nginx
   
   # CentOS/RHEL
   sudo yum install nodejs npm postgresql nginx
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   sudo -u postgres createdb modern_library
   sudo -u postgres createuser -s modern_library_user
   
   # Set password
   sudo -u postgres psql
   ALTER USER modern_library_user PASSWORD 'your_secure_password';
   \q
   ```

3. **Application Setup**
   ```bash
   # Clone repository
   git clone https://github.com/ecetiner87/modern-library.git
   cd modern-library
   
   # Install dependencies
   npm install --production
   
   # Configure environment
   cp env.example .env
   # Edit .env with production values
   
   # Run migrations
   npm run migrate
   ```

4. **Frontend Build**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

5. **Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "library-api"
   pm2 startup
   pm2 save
   ```

#### Nginx Configuration

1. **Create Nginx Config**
   ```nginx
   # /etc/nginx/sites-available/modern-library
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/modern-library/frontend/build;
           try_files $uri $uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/modern-library /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Option 2: SSL/HTTPS Setup

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Generate Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🐳 Docker Deployment

### Docker Compose (Recommended)

1. **Production Docker Compose**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:13
       environment:
         POSTGRES_DB: modern_library
         POSTGRES_USER: library_user
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       restart: unless-stopped
   
     backend:
       build: .
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - DB_CLIENT=postgresql
         - DB_HOST=postgres
         - DB_NAME=modern_library
         - DB_USER=library_user
         - DB_PASSWORD=${DB_PASSWORD}
       depends_on:
         - postgres
       restart: unless-stopped
   
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend
       restart: unless-stopped
   
   volumes:
     postgres_data:
   ```

2. **Deploy with Docker**
   ```bash
   # Create production environment file
   echo "DB_PASSWORD=your_secure_password" > .env.prod
   
   # Build and start services
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
   
   # Run migrations
   docker-compose -f docker-compose.prod.yml exec backend npm run migrate
   ```

### Individual Docker Images

1. **Backend Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install --production
   
   COPY . .
   
   EXPOSE 3001
   
   CMD ["npm", "start"]
   ```

2. **Frontend Dockerfile**
   ```dockerfile
   # Build stage
   FROM node:18-alpine as build
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

---

## ☁️ Cloud Deployment

### Heroku Deployment

1. **Prepare Application**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login and create app
   heroku login
   heroku create your-library-app
   ```

2. **Configure Heroku**
   ```bash
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set NPM_CONFIG_PRODUCTION=false
   ```

3. **Deploy**
   ```bash
   git push heroku main
   heroku run npm run migrate
   ```

### DigitalOcean App Platform

1. **Create App Spec**
   ```yaml
   # .do/app.yaml
   name: modern-library
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/modern-library
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
   
   - name: web
     source_dir: /frontend
     github:
       repo: your-username/modern-library
       branch: main
     build_command: npm run build
     instance_count: 1
     instance_size_slug: basic-xxs
   
   databases:
   - engine: PG
     name: library-db
     num_nodes: 1
     size: db-s-1vcpu-1gb
   ```

### AWS Deployment

#### EC2 with RDS

1. **Launch EC2 Instance**
   - AMI: Ubuntu 20.04 LTS
   - Instance Type: t3.micro (or larger)
   - Security Groups: HTTP (80), HTTPS (443), SSH (22), Custom (3001)

2. **Setup RDS PostgreSQL**
   - Engine: PostgreSQL
   - Instance: db.t3.micro
   - Storage: 20 GB GP2

3. **Deploy Application**
   ```bash
   # SSH to EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install dependencies
   sudo apt update
   sudo apt install nodejs npm nginx
   
   # Clone and setup application
   git clone https://github.com/your-username/modern-library.git
   cd modern-library
   npm install --production
   
   # Configure environment with RDS endpoint
   cp env.example .env
   # Edit .env with RDS connection details
   
   # Build frontend
   cd frontend && npm install && npm run build
   
   # Start with PM2
   npm install -g pm2
   pm2 start server.js --name library-api
   ```

---

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Database
DB_CLIENT=postgresql
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=modern_library
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

# Application
NODE_ENV=production
PORT=3001

# Security
SESSION_SECRET=your-long-random-string
CORS_ORIGIN=https://your-domain.com

# External Services (if applicable)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-email-password
```

### Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique passwords
   - Rotate secrets regularly

2. **Database Security**
   ```bash
   # Create read-only user for reporting
   CREATE USER library_readonly WITH PASSWORD 'readonly_password';
   GRANT CONNECT ON DATABASE modern_library TO library_readonly;
   GRANT USAGE ON SCHEMA public TO library_readonly;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO library_readonly;
   ```

3. **Nginx Security Headers**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   add_header Referrer-Policy "strict-origin-when-cross-origin";
   ```

---

## 🗄️ Database Migration

### From SQLite to PostgreSQL

1. **Export SQLite Data**
   ```bash
   # Export as SQL
   sqlite3 database.sqlite .dump > library_backup.sql
   
   # Or export as CSV
   sqlite3 database.sqlite
   .mode csv
   .output books.csv
   SELECT * FROM books;
   .quit
   ```

2. **Import to PostgreSQL**
   ```bash
   # Method 1: Direct SQL import (may need editing)
   psql -U library_user -d modern_library -f library_backup.sql
   
   # Method 2: Using CSV
   psql -U library_user -d modern_library
   \copy books FROM 'books.csv' WITH (FORMAT csv, HEADER true);
   ```

3. **Verify Migration**
   ```sql
   -- Check record counts
   SELECT COUNT(*) FROM books;
   SELECT COUNT(*) FROM reading_history;
   SELECT COUNT(*) FROM categories;
   
   -- Verify data integrity
   SELECT * FROM books LIMIT 5;
   ```

### Database Backup Strategy

1. **Automated Backups**
   ```bash
   #!/bin/bash
   # backup.sh
   DATE=$(date +%Y%m%d_%H%M%S)
   pg_dump -U library_user modern_library > "backup_${DATE}.sql"
   
   # Keep only last 7 days of backups
   find . -name "backup_*.sql" -mtime +7 -delete
   ```

2. **Cron Job for Backups**
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup.sh
   ```

---

## 🔍 Monitoring & Maintenance

### Health Checks

1. **Application Health**
   ```bash
   # Check API health
   curl http://your-domain.com/api/health
   
   # Check database connection
   curl http://your-domain.com/api/stats
   ```

2. **System Monitoring**
   ```bash
   # PM2 monitoring
   pm2 monit
   
   # System resources
   htop
   df -h
   ```

### Log Management

1. **Application Logs**
   ```bash
   # PM2 logs
   pm2 logs library-api
   
   # Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

2. **Log Rotation**
   ```bash
   # Configure logrotate
   sudo nano /etc/logrotate.d/library-app
   ```

---

## 🚨 Troubleshooting

### Common Production Issues

1. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   
   # Restart PM2 if needed
   pm2 restart library-api
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   psql -U library_user -h db-host -d modern_library -c "SELECT 1;"
   
   # Check connection pool
   ps aux | grep postgres
   ```

3. **Frontend Build Issues**
   ```bash
   # Rebuild frontend
   cd frontend
   rm -rf build node_modules
   npm install
   npm run build
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_books_is_read ON books(is_read);
   CREATE INDEX idx_books_category_id ON books(category_id);
   CREATE INDEX idx_reading_history_finish_date ON reading_history(finish_date);
   
   -- Analyze table statistics
   ANALYZE books;
   ANALYZE reading_history;
   ```

2. **Nginx Caching**
   ```nginx
   # Add to nginx config
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Frontend build successful
- [ ] SSL certificates ready (production)
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Post-Deployment
- [ ] Health checks passing
- [ ] Database populated correctly
- [ ] Frontend accessible
- [ ] API endpoints responding
- [ ] SSL certificate valid
- [ ] Monitoring configured
- [ ] Backup job scheduled

### Regular Maintenance
- [ ] Monitor application logs
- [ ] Check disk space
- [ ] Update dependencies monthly
- [ ] Test backup restoration quarterly
- [ ] Review security updates
- [ ] Monitor performance metrics

---

This deployment guide covers the main scenarios for hosting the Modern Library Management System. Choose the deployment method that best fits your infrastructure and requirements. 