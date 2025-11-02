# Use Ubuntu 22.04 base image
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip python3-dev \
    build-essential cmake g++ gcc wget git curl \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender1 libgl1-mesa-glx \
    libgomp1 libgthread-2.0-0 ffmpeg libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip
RUN pip3 install --upgrade pip setuptools wheel

# Install numpy first (critical for dependency resolution)
RUN pip3 install numpy==1.24.3

# Install onnxruntime separately with specific version that works on Ubuntu 22.04
RUN pip3 install onnxruntime==1.16.3 --no-deps && \
    pip3 install protobuf==3.20.3 flatbuffers coloredlogs sympy

# Copy and install remaining dependencies
COPY requirements.txt .

# Install dependencies excluding onnxruntime (already installed)
RUN pip3 install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    python-multipart==0.0.6 \
    opencv-python-headless==4.9.0.80 \
    insightface==0.7.3 \
    scikit-learn==1.3.2 \
    imgaug==0.4.0 \
    Pillow==10.2.0 \
    mediapipe==0.10.9 \
    psycopg2-binary==2.9.9 \
    python-dotenv==1.0.0 \
    matplotlib==3.8.2

# Copy application code
COPY main.py .

# Create required directories
RUN mkdir -p dataset test-images output

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Start FastAPI app with single worker to avoid memory issues
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]