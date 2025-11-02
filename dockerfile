# Use Ubuntu 22.04 base image
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-dev \
    build-essential cmake g++ gcc wget git curl \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender1 libgl1-mesa-glx \
    libgomp1 libgthread-2.0-0 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip and tools
RUN pip3 install --upgrade pip setuptools wheel

# Copy dependencies
COPY requirements.txt .

# ✅ Install numpy first
RUN pip3 install numpy==1.24.3

# ✅ Replace problematic onnxruntime with safe alternative
RUN pip3 install onnxruntime-openvino==1.15.1

# Install all remaining dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy main app
COPY main.py .

# Create necessary folders
RUN mkdir -p dataset test-images output

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000')" || exit 1

# Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
