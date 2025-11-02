# Use Ubuntu base for full compatibility with onnxruntime + OpenCV
FROM ubuntu:22.04

# Install Python and system dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-dev \
    build-essential g++ gcc cmake \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender1 libgomp1 wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Upgrade pip and essential tools
RUN pip3 install --upgrade pip setuptools wheel

# Copy and install Python dependencies
COPY requirements.txt .

# Install packages (split onnxruntime + numpy for safety)
RUN pip3 install --no-cache-dir numpy==1.24.3 onnxruntime==1.15.1 && \
    pip3 install --no-cache-dir -r requirements.txt

# Copy your main application code
COPY main.py .

# Create required directories
RUN mkdir -p dataset test-images output

# Expose the FastAPI port
EXPOSE 8000

# Health check (optional)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# Start FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
