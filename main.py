from fastapi import FastAPI
import psycopg2
import json

conn = psycopg2.connect(
    dbname="gis_db",
    user="postgres",
    password="adithk568",
    host="localhost",
    port="5432"
)


app = FastAPI()

@app.get('/')
def get_features(tenant_id: str,
    start_epoch: int,
    end_epoch: int,
    crs: int = 4326):
    return {"status":"ok"}