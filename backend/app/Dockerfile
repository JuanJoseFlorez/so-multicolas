# Imagen base
FROM python:3.9-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

# Exponer el puerto y definir el comando de inicio
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
