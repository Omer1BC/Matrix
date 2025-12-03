docker buildx build --platform linux/amd64 -t matrix-backend:latest backend/

docker tag matrix-backend:latest nikoparas1/matrix-backend:latest

docker push nikoparas1/matrix-backend:latest