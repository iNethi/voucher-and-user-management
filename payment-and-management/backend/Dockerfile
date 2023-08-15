# ---- Base Python ----
FROM python:3.9-slim AS base
WORKDIR /app

# Install system dependencies for mysqlclient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    gcc \
    pkg-config \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Now install your Python packages
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
COPY . .


# ---- Release with Gunicorn ----
FROM base AS release
CMD ["gunicorn", "inethi_management.wsgi:application", "--bind", "0.0.0.0:8000"]
