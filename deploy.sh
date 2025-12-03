#!/bin/bash
set -e  # Exit on error

echo "Building Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 -t matrix-backend:latest backend/

echo "Tagging image..."
docker tag matrix-backend:latest nikoparas1/matrix-backend:latest

echo "Pushing to Docker Hub..."
docker push nikoparas1/matrix-backend:latest

echo "Deploying to Railway..."
cd backend
railway up
cd ..

echo "Deploying frontend to Vercel..."
cd frontend
vercel --prod
cd ..

echo "✅ Deployment complete!"