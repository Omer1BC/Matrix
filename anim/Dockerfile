# FROM manimcommunity/manim:stable
# WORKDIR /manim
# Use official Python 3.11 slim image
FROM python:3.11-slim

# Install minimal build tools and runtime libs required for manim and pycairo
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libglib2.0-dev \
    ffmpeg \
    libgl1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements file (if you have one)
# COPY requirements.txt .

# Install manim without latex dependencies (no texlive packages)
RUN pip install --no-cache-dir manim

# Copy your project files
# COPY . .

# Default command (optional)
# CMD ["manim", "--help"]

