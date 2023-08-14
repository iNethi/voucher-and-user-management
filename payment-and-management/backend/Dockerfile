# ---- Base Python ----
FROM python:3.9-slim AS base
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    gcc \
    && apt-get clean

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
COPY . .


# ---- Release with Gunicorn ----
FROM base AS release
CMD ["gunicorn", "inethi_management.wsgi:application", "--bind", "0.0.0.0:8000"]
