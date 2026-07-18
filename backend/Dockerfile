# ============================================================
# Stage 1: Builder — install dependencies only
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /app

# System libs needed to compile wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
    libffi-dev \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy only requirements first → cache-friendly layer
COPY requirements.txt .

# Install dependencies (NO PyTorch - using Google API instead)
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt


# ============================================================
# Stage 2: Runtime — lean final image
# ============================================================
FROM python:3.12-slim AS runtime

# Runtime libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libmupdf-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source
COPY --chown=appuser:appgroup app.py .
COPY --chown=appuser:appgroup extensions.py .
COPY --chown=appuser:appgroup models.py .
COPY --chown=appuser:appgroup routes/ routes/
COPY --chown=appuser:appgroup extraction/ extraction/
COPY --chown=appuser:appgroup matching/ matching/
COPY --chown=appuser:appgroup processing/ processing/
COPY --chown=appuser:appgroup utils/ utils/

# Writable directories
RUN mkdir -p uploaded_files && chown appuser:appgroup uploaded_files

USER appuser

EXPOSE 8000

CMD ["gunicorn", "app:app", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "1", \
     "--threads", "4", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
