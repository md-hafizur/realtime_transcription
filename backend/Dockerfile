# Development Dockerfile - with hot reload and UV
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    curl \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install UV using pip
RUN pip install uv

# Copy dependency files
COPY pyproject.toml .
COPY uv.lock* ./

# Copy application code (will be overridden by volume mount in dev)
COPY . .

# Create virtual environment and install dependencies with UV
RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install -e .

# Download Vosk model
RUN mkdir -p /app/models_data && \
    cd /app/models_data && \
    wget -q https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip && \
    unzip -o -q vosk-model-small-en-us-0.15.zip && \
    rm vosk-model-small-en-us-0.15.zip


# Create empty __init__.py files
RUN touch app/__init__.py app/models/__init__.py app/schemas/__init__.py \
    app/crud/__init__.py app/api/__init__.py app/api/v1/__init__.py \
    app/services/__init__.py

# Expose port
EXPOSE 8000

# Run with reload for development
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]