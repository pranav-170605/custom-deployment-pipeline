FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN sed -i "s/psycopg2==/psycopg2-binary==/g" requirements.txt || true
RUN sed -i "s/^psycopg2\$/psycopg2-binary/g" requirements.txt || true
RUN pip install --no-cache-dir -r requirements.txt uvicorn python-dotenv
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
