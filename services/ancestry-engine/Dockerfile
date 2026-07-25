FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    bcftools \
    ca-certificates \
    openjdk-17-jre-headless \
    r-base \
    tabix \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/ancestry-engine
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app

RUN useradd --create-home --uid 10001 ancestry \
    && mkdir -p /data/ancestry /dev/shm/truth-machine-ancestry \
    && chown -R ancestry:ancestry /data/ancestry /dev/shm/truth-machine-ancestry /srv/ancestry-engine
USER ancestry

EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers"]
