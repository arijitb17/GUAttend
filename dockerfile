FROM python:3.10-slim

# Set environment variable to fix onnxruntime security issue on Render
ENV LD_PRELOAD=/lib/x86_64-linux-gnu/libstdc++.so.6

# Install build dependencies and runtime dependencies
RUN apt-get update && apt-get install -y \
    # Build tools (needed for insightface compilation)
    build-essential \
    g++ \
    gcc \
    cmake \
    # Runtime dependencies for OpenCV and face recognition
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgthread-2.0-0 \
    # Additional for onnxruntime
    libstdc++6 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip first
RUN pip install --upgrade pip setuptools wheel

# Copy and install Python dependencies
COPY requirements.txt .

# Install packages with specific compatible versions
RUN pip install --no-cache-dir numpy==1.24.3 && \
    pip install --no-cache-dir onnxruntime==1.15.1 && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Create necessary directories
RUN mkdir -p dataset test-images output

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]