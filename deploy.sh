#!/bin/bash
set -e  # Exit on error

SKIP_RAILWAY=false
SKIP_VERCEL=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-railway)
      SKIP_RAILWAY=true
      shift
      ;;
    --skip-vercel)
      SKIP_VERCEL=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--skip-railway] [--skip-vercel]"
      exit 1
      ;;
  esac
done

echo "Building Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 -t matrix-backend:latest backend/

echo "Tagging image..."
docker tag matrix-backend:latest nikoparas1/matrix-backend:latest

echo "Pushing to Docker Hub..."
docker push nikoparas1/matrix-backend:latest

if [ "$SKIP_RAILWAY" = false ]; then
  echo "Deploying to Railway..."
  cd backend
  railway up --detach
  cd ..
else
  echo "Skipping Railway deployment"
fi

if [ "$SKIP_VERCEL" = false ]; then
  echo "Deploying frontend to Vercel..."
  cd frontend
  vercel --prod
  cd ..
else
  echo "Skipping Vercel deployment"
fi

echo "✅ Deployment complete!"