# ML SERVICE DOCKERFILE

FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Instala dependencias con timeout extendido (TensorFlow es grande)
RUN pip install --default-timeout=300 --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5002

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5002"]
