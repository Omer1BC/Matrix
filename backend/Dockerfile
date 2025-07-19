FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libglib2.0-dev \
    ffmpeg \
    libgl1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
    
COPY requirements.txt . 
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
