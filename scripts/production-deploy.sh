#!/bin/bash

# Production Deployment Script for Modern Library Management System
# This script automates the production deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Modern Library Management System"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.yml"

# Helper functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  ${PROJECT_NAME}${NC}"
    echo -e "${BLUE}  Production Deployment Script${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Setup environment
setup_environment() {
    print_step "Setting up production environment..."
    
    if [[ ! -f "env.production.example" ]]; then
        print_error "env.production.example not found"
        exit 1
    fi
    
    if [[ ! -f "$ENV_FILE" ]]; then
        print_warning "Production environment file not found. Creating from example..."
        cp env.production.example "$ENV_FILE"
        
        echo
        print_warning "IMPORTANT: Please edit $ENV_FILE with your production values:"
        echo "  - Set secure database password"
        echo "  - Set secure JWT secret (32+ characters)"
        echo "  - Update CORS_ORIGIN with your domain"
        echo "  - Update REACT_APP_API_URL with your API URL"
        echo
        
        read -p "Press Enter after updating $ENV_FILE to continue..."
    fi
    
    print_success "Environment setup completed"
}

# Check migration data
check_migration_data() {
    print_step "Checking migration data..."
    
    if [[ -d "migration-data" ]] && [[ -n "$(ls -A migration-data 2>/dev/null)" ]]; then
        print_success "Migration data found in migration-data/"
        ls -la migration-data/
        echo
        read -p "Do you want to run data migration? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            MIGRATE_DATA=true
        fi
    else
        print_warning "No migration data found. Skipping data migration."
        echo "To migrate Derby data later, place CSV files in migration-data/ and run:"
        echo "  docker-compose exec backend npm run migrate:derby"
    fi
}

# Build and start services
deploy_services() {
    print_step "Building and starting services..."
    
    # Pull latest images
    docker-compose --env-file "$ENV_FILE" pull
    
    # Build services
    docker-compose --env-file "$ENV_FILE" build --no-cache
    
    # Start PostgreSQL first
    docker-compose --env-file "$ENV_FILE" up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    print_step "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Check PostgreSQL health
    local retries=30
    while ! docker-compose --env-file "$ENV_FILE" exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        if [[ $retries -eq 0 ]]; then
            print_error "PostgreSQL failed to start"
            exit 1
        fi
        echo -n "."
        sleep 2
        ((retries--))
    done
    echo
    
    print_success "PostgreSQL is ready"
    
    # Start remaining services
    docker-compose --env-file "$ENV_FILE" up -d
    
    print_success "All services started"
}

# Run data migration
run_migration() {
    if [[ "$MIGRATE_DATA" == "true" ]]; then
        print_step "Running data migration..."
        docker-compose --env-file "$ENV_FILE" exec backend npm run migrate:derby
        print_success "Data migration completed"
    fi
}

# Verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check backend health
    local backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
    if [[ "$backend_health" == "200" ]]; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed (HTTP $backend_health)"
    fi
    
    # Check frontend
    local frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [[ "$frontend_health" == "200" ]]; then
        print_success "Frontend is accessible"
    else
        print_error "Frontend health check failed (HTTP $frontend_health)"
    fi
    
    # Show service status
    echo
    print_step "Service status:"
    docker-compose --env-file "$ENV_FILE" ps
}

# Print completion message
print_completion() {
    echo
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo
    echo "🌐 Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:3001/api"
    echo "  API Health: http://localhost:3001/api/health"
    echo
    echo "📊 Management Commands:"
    echo "  View logs: docker-compose --env-file $ENV_FILE logs -f"
    echo "  Stop services: docker-compose --env-file $ENV_FILE down"
    echo "  Restart services: docker-compose --env-file $ENV_FILE restart"
    echo "  Run migration: docker-compose --env-file $ENV_FILE exec backend npm run migrate:derby"
    echo
    echo "📚 Documentation:"
    echo "  Production Guide: ./PRODUCTION_DEPLOYMENT.md"
    echo "  API Documentation: ./API_DOCUMENTATION.md"
    echo
    print_success "Ready to use your Modern Library Management System!"
}

# Cleanup function
cleanup() {
    if [[ $? -ne 0 ]]; then
        print_error "Deployment failed. Cleaning up..."
        docker-compose --env-file "$ENV_FILE" down 2>/dev/null || true
    fi
}

# Main execution
main() {
    trap cleanup EXIT
    
    print_header
    check_prerequisites
    setup_environment
    check_migration_data
    deploy_services
    run_migration
    verify_deployment
    print_completion
    
    trap - EXIT
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --no-migrate   Skip data migration prompt"
    echo "  --env-file     Specify custom environment file"
    echo
    echo "Examples:"
    echo "  $0                    # Full deployment with prompts"
    echo "  $0 --no-migrate       # Deploy without migration"
    echo "  $0 --env-file .env    # Use custom environment file"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --no-migrate)
            MIGRATE_DATA=false
            shift
            ;;
        --env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main 