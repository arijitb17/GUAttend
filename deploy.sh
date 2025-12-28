#!/bin/bash

#############################################################################
# GUAttend Auto-Deploy Script
# This script pulls latest changes from GitHub and deploys them to EC2
#############################################################################

set -e  # Exit on any error

# Configuration
PROJECT_DIR="/home/ubuntu/GUAttend"
BRANCH="main"  # Change this to your branch name if different
LOG_FILE="/home/ubuntu/deploy.log"
BACKUP_DIR="/home/ubuntu/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         GUAttend Auto-Deploy from GitHub                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

#############################################################################
# STEP 1: Pre-deployment checks
#############################################################################
log "🔍 Step 1: Pre-deployment checks"

cd "$PROJECT_DIR" || {
    error "Failed to navigate to project directory: $PROJECT_DIR"
    exit 1
}

# Check if git repo
if [ ! -d ".git" ]; then
    error "Not a git repository. Please initialize git first."
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    warning "You have uncommitted local changes:"
    git status -s
    read -p "Do you want to stash these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Stashing local changes..."
        git stash
    else
        error "Deployment cancelled. Commit or stash your changes first."
        exit 1
    fi
fi

#############################################################################
# STEP 2: Create backup
#############################################################################
log "💾 Step 2: Creating backup"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="guattend_backup_$TIMESTAMP"

# Backup critical files
info "Backing up critical files..."
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
cp -r .env* "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
cp -r prisma "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true

# Create a tarball of the entire project (excluding node_modules)
log "Creating full backup tarball..."
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" . 2>/dev/null || true

log "✅ Backup created: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"

#############################################################################
# STEP 3: Pull latest changes from GitHub
#############################################################################
log "📥 Step 3: Pulling latest changes from GitHub"

# Fetch latest changes
log "Fetching from origin..."
git fetch origin

# Get current commit
CURRENT_COMMIT=$(git rev-parse HEAD)
log "Current commit: $CURRENT_COMMIT"

# Pull changes
log "Pulling from origin/$BRANCH..."
git pull origin "$BRANCH" || {
    error "Failed to pull from GitHub"
    exit 1
}

# Get new commit
NEW_COMMIT=$(git rev-parse HEAD)
log "New commit: $NEW_COMMIT"

# Check if there were changes
if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    info "No new changes detected. Already up to date!"
    echo ""
    read -p "Continue with rebuild anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled - no changes."
        exit 0
    fi
else
    log "✅ Successfully pulled new changes"
    echo ""
    log "📝 Changes summary:"
    git log --oneline "$CURRENT_COMMIT..$NEW_COMMIT"
    echo ""
fi

#############################################################################
# STEP 4: Install/Update dependencies
#############################################################################
log "📦 Step 4: Installing/Updating dependencies"

# Check if package.json changed
if git diff --name-only "$CURRENT_COMMIT" "$NEW_COMMIT" | grep -q "package.json"; then
    warning "package.json changed, installing dependencies..."
    npm install
else
    info "No package.json changes, skipping npm install"
fi

# Check if Python requirements changed (for recognition API)
if [ -f "requirements.txt" ]; then
    if git diff --name-only "$CURRENT_COMMIT" "$NEW_COMMIT" | grep -q "requirements.txt"; then
        warning "requirements.txt changed, updating Python dependencies..."
        pip3 install -r requirements.txt --break-system-packages
    fi
fi

#############################################################################
# STEP 5: Database migrations
#############################################################################
log "🗄️  Step 5: Checking for database migrations"

# Check if prisma schema changed
if git diff --name-only "$CURRENT_COMMIT" "$NEW_COMMIT" | grep -q "prisma/schema.prisma"; then
    warning "Prisma schema changed, running migrations..."
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    read -p "Do you want to run database migrations? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Running database migrations..."
        npx prisma migrate deploy
    else
        warning "Skipping database migrations"
    fi
else
    info "No schema changes, skipping migrations"
    # Still regenerate client in case
    npx prisma generate
fi

#############################################################################
# STEP 6: Build application
#############################################################################
log "🔨 Step 6: Building application"

# Clear Next.js cache
log "Clearing Next.js cache..."
rm -rf .next

# Build
log "Building Next.js application..."
npm run build || {
    error "Build failed! Rolling back..."
    git reset --hard "$CURRENT_COMMIT"
    npm run build
    error "Restored to previous commit. Please fix build errors and try again."
    exit 1
}

log "✅ Build successful"

#############################################################################
# STEP 7: Restart services
#############################################################################
log "🔄 Step 7: Restarting services"

# Restart Next.js
log "Restarting Next.js application..."
pm2 restart guattend-nextjs || pm2 start npm --name "guattend-nextjs" -- start

# Restart recognition API if it exists
if pm2 list | grep -q "guattend-recognition"; then
    log "Restarting recognition API..."
    pm2 restart guattend-recognition
fi

# Save PM2 configuration
pm2 save

log "✅ Services restarted"

#############################################################################
# STEP 8: Health checks
#############################################################################
log "🏥 Step 8: Running health checks"

# Wait for services to start
sleep 5

# Check Next.js
log "Checking Next.js health..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    log "✅ Next.js is healthy"
else
    error "❌ Next.js health check failed"
fi

# Check Recognition API
if pm2 list | grep -q "guattend-recognition"; then
    log "Checking Recognition API health..."
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        log "✅ Recognition API is healthy"
    else
        warning "❌ Recognition API health check failed"
    fi
fi

#############################################################################
# STEP 9: Cleanup old backups
#############################################################################
log "🧹 Step 9: Cleaning up old backups"

# Keep only last 5 backups
cd "$BACKUP_DIR"
ls -t guattend_backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
log "✅ Old backups cleaned up"

#############################################################################
# STEP 10: Summary
#############################################################################
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║               🎉 Deployment Successful! 🎉              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
log "📊 Deployment Summary:"
log "   • Previous commit: $CURRENT_COMMIT"
log "   • New commit: $NEW_COMMIT"
log "   • Backup location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
log "   • Services: $(pm2 list | grep guattend | wc -l) running"
echo ""
log "🌐 Application URLs:"
log "   • Main app: https://guattend.duckdns.org"
log "   • Recognition API: https://guattend.duckdns.org/recognition"
echo ""
log "📋 Next steps:"
log "   1. Test the application in browser"
log "   2. Check PM2 logs: pm2 logs"
log "   3. Monitor for any errors"
echo ""

# Show recent logs
log "📝 Recent PM2 logs:"
pm2 logs --lines 10 --nostream

echo ""
log "✨ Deployment completed successfully!"
echo ""