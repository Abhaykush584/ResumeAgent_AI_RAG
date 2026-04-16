# ============================================================
# Stage 1: Builder — install dependencies only
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /install

# System libs needed to compile wheels (MuPDF, Pillow)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first → cache-friendly layer
COPY requirements.txt .

# Install into a prefix so we can COPY only the result
RUN pip install --upgrade pip \
 && pip install --prefix=/install/deps --no-cache-dir -r requirements.txt


# ============================================================
# Stage 2: Runtime — lean final image
# ============================================================
FROM python:3.12-slim AS runtime

# Runtime libs (no gcc needed here)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Pull installed packages from builder
COPY --from=builder /install/deps /usr/local

# Copy application source (no __pycache__, no .env, no uploaded_files)
COPY --chown=appuser:appgroup app.py .
COPY --chown=appuser:appgroup extraction/ extraction/
COPY --chown=appuser:appgroup matching/ matching/
COPY --chown=appuser:appgroup processing/ processing/
COPY --chown=appuser:appgroup utils/ utils/

# Writable uploads directory (bind-mount or volume in compose)
RUN mkdir -p uploaded_files && chown appuser:appgroup uploaded_files

USER appuser

EXPOSE 8000

# Gunicorn: 4 workers, timeout 120 s, single-threaded per worker
CMD ["gunicorn", "app:app", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
