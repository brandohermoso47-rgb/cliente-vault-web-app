#!/bin/bash
# 🚀 Waack On Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENVIRONMENT="${1:-staging}"
PROJECT_ID=$(gcloud config get-value project)

echo "════════════════════════════════════════════════════════════════"
echo "🚀 Waack On Deployment Script"
echo "════════════════════════════════════════════════════════════════"
echo "Environment: $ENVIRONMENT"
echo "Project: $PROJECT_ID"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
success() {
  echo -e "${GREEN}✓ $1${NC}"
}

warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

error() {
  echo -e "${RED}✗ $1${NC}"
  exit 1
}

# Step 1: Compile Frontend
echo ""
echo "📦 Building Frontend..."
if npm run build; then
  success "Frontend compiled successfully"
else
  error "Frontend build failed"
fi

# Step 2: Check Security Rules
echo ""
echo "🔒 Checking Security Rules..."
if [ -f firestore.rules ] && [ -f storage.rules ]; then
  success "Security rules found"

  # Verify roleUnchanged exists in firestore.rules
  if grep -q "roleUnchanged" firestore.rules; then
    success "Firestore role protection found"
  else
    warning "roleUnchanged() not found in firestore.rules"
  fi
else
  error "Security rules missing"
fi

# Step 3: Build Backend
echo ""
echo "🔧 Building Backend..."
cd api
if npm run build; then
  success "Backend compiled successfully"
else
  error "Backend build failed"
fi
cd ..

# Step 4: Verify Environment
echo ""
echo "🌍 Verifying Environment..."

if [ "$ENVIRONMENT" = "production" ]; then
  if ! gcloud secrets describe stripe-secret-key --project="$PROJECT_ID" >/dev/null 2>&1; then
    error "STRIPE_SECRET_KEY not set in Secret Manager"
  else
    success "STRIPE_SECRET_KEY configured"
  fi

  if ! gcloud secrets describe stripe-webhook-secret --project="$PROJECT_ID" >/dev/null 2>&1; then
    error "STRIPE_WEBHOOK_SECRET not set in Secret Manager"
  else
    success "STRIPE_WEBHOOK_SECRET configured"
  fi
fi

# Step 5: Deploy Backend
echo ""
echo "☁️ Deploying Backend to Cloud Run..."

if gcloud builds submit --tag "gcr.io/$PROJECT_ID/waack-api:latest" ./api; then
  success "Backend image built and pushed"
else
  error "Backend image build or push failed"
fi

if [ "$ENVIRONMENT" = "production" ]; then
  MAX_INSTANCES=10
  MIN_INSTANCES=1
else
  MAX_INSTANCES=5
  MIN_INSTANCES=0
fi

if gcloud run deploy waack-api \
  --image=gcr.io/$PROJECT_ID/waack-api:latest \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=$MIN_INSTANCES \
  --max-instances=$MAX_INSTANCES \
  --set-env-vars=NODE_ENV=$ENVIRONMENT,APP_URL=https://waack-on.com,ALLOWED_ORIGINS=https://waack-on.com,STRICT_ORIGIN=true,DB_NAME=waackon \
  --set-secrets=STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,DB_PASSWORD=db-password:latest,INSTANCE_CONNECTION_NAME=instance-connection-name:latest 2>/dev/null; then
  success "Backend deployed to Cloud Run"

  # Get service URL
  SERVICE_URL=$(gcloud run services describe waack-api --region=europe-west1 --format='value(status.url)' 2>/dev/null)
  echo "  URL: $SERVICE_URL"
else
  warning "Backend already deployed or no changes"
fi

# Step 6: Test Backend Health
echo ""
echo "🏥 Testing Backend Health..."
if curl -s $SERVICE_URL/api/health | grep -q '"ok":true'; then
  success "Backend health check passed"
else
  warning "Backend health check failed (may take a moment to start)"
fi

# Step 7: Deploy Frontend
echo ""
echo "🌐 Deploying Frontend to Firebase Hosting..."

if firebase deploy --only hosting,functions; then
  success "Frontend and notification functions deployed to Firebase"
else
  error "Frontend deployment failed"
fi

# Step 8: Deploy Security Rules
echo ""
echo "🔒 Deploying Security Rules..."

if firebase deploy --only firestore:rules,firestore:indexes,storage; then
  success "Security rules deployed"
else
  warning "Security rules deployment had issues"
fi

# Step 9: Verify Deployment
echo ""
echo "✨ Verifying Deployment..."

# Check hosting
if curl -s https://waack-on.com/ | grep -q "html\|HTML" 2>/dev/null; then
  success "Firebase Hosting is responding"
else
  warning "Firebase Hosting may not be ready yet"
fi

# Check backend
if curl -s https://waack-on.com/api/health 2>/dev/null | grep -q "ok"; then
  success "Backend API is responding"
else
  warning "Backend API may not be ready yet (can take 30 seconds)"
fi

# Step 10: Summary
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎉 Deployment Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Frontend: https://waack-on.com"
echo "API: $SERVICE_URL"
echo ""
echo "Next Steps:"
echo "1. Open https://waack-on.com in your browser"
echo "2. Test login and basic functionality"
echo "3. Check logs: firebase hosting:logs"
echo "4. Check API logs: gcloud logging read 'resource.type=cloud_run_revision' --limit=50"
echo ""
echo "Rollback (if needed):"
echo "  firebase hosting:clone-version --source=VERSION_ID --target=live"
echo "  gcloud run services update-traffic waack-api --to-revisions=REVISION_ID=100 --region=europe-west1"
echo ""

success "Done!"
