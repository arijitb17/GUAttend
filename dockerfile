# Use Python slim image (Debian-based, better compatibility)
FROM python:3.10-slim-bullseye

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    libopenblas-dev \
    liblapack-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip setuptools wheel

# Install numpy first
RUN pip install numpy==1.24.3

# Install onnxruntime from a different source (this version works on more kernels)
RUN pip install onnxruntime==1.15.1

# Install protobuf separately (critical for insightface)
RUN pip install protobuf==3.20.3

# Copy requirements and install
COPY requirements.txt .

# Install remaining dependencies one by one to avoid conflicts
RUN pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    python-multipart==0.0.6 \
    opencv-python-headless==4.9.0.80 \
    scikit-learn==1.3.2 \
    Pillow==10.2.0 \
    mediapipe==0.10.9 \
    psycopg2-binary==2.9.9 \
    python-dotenv==1.0.0 \
    matplotlib==3.8.2

# Install imgaug and insightface last
RUN pip install imgaug==0.4.0
RUN pip install insightface==0.7.3

# Copy application
COPY main.py .

# Create directories
RUN mkdir -p dataset test-images output

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# 🧠 Preload the InsightFace model once before serving (fixes lazy protobuf issue)
RUN python -c "from insightface.app import FaceAnalysis; app = FaceAnalysis(); app.prepare(ctx_id=0); print('InsightFace model cached successfully.')"

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
