# Use Ubuntu 22.04 for full compatibility with onnxruntime, mediapipe, OpenCV, and insightface
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install Python and required system packages
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-dev \
    build-essential cmake g++ gcc wget git curl \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender1 libgl1-mesa-glx \
    libgomp1 libgthread-2.0-0 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Upgrade pip and essential tools
RUN pip3 install --upgrade pip setuptools wheel

# Copy Python dependencies
COPY requirements.txt .

# Install core dependencies separately (for stability)
RUN pip3 install numpy==1.24.3 onnxruntime==1.15.1

# Install remaining Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Create runtime directories
RUN mkdir -p dataset test-images output

# Expose FastAPI port
EXPOSE 8000

# Healthcheck for uptime monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000')" || exit 1

# Start FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
