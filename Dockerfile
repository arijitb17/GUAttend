FROM node:18-bullseye

# ----------------------------
# Build-time environment vars
# ----------------------------
ARG DATABASE_URL
ARG JWT_SECRET=build-secret
ARG EMAIL_USER
ARG EMAIL_PASS
ARG PYTHON_API_URL

ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV EMAIL_USER=${EMAIL_USER}
ENV EMAIL_PASS=${EMAIL_PASS}
ENV PYTHON_API_URL=${PYTHON_API_URL}

# ----------------------------
# System dependencies
# ----------------------------
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    supervisor \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ----------------------------
# Copy Prisma schema first
# ----------------------------
COPY prisma ./prisma

# ----------------------------
# Node dependencies
# ----------------------------
COPY package*.json ./
RUN npm install

# ----------------------------
# Python dependencies (HEAVY AI FIX)
# ----------------------------
COPY requirements.txt .
RUN pip3 install --upgrade pip && \
    pip3 install \
    --no-cache-dir \
    --prefer-binary \
    --timeout=1000 \
    -r requirements.txt

# ----------------------------
# Copy rest of app
# ----------------------------
COPY . .

# ----------------------------
# Build Next.js
# ----------------------------
RUN npm run build

# ----------------------------
# Supervisor
# ----------------------------
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3000 8000

CMD ["/usr/bin/supervisord", "-n"]
