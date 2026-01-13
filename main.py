from fastapi import FastAPI
import psycopg2
import json
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


conn = psycopg2.connect(
    dbname="gis_db",
    user="postgres",
    password="adithk568",
    host="localhost",
    port="5432"
)





@app.get('/get-features')
def get_features(tenant_id: str,
    start_epoch: int,
    end_epoch: int,
    crs: int = 4326):
    
    cursor = conn.cursor()
    
    if crs == 3857:
        geom_sql = "ST_Transform(geom, 3857)"
    else:
        geom_sql = "geom"
        
    query = f"""
            SELECT
                tenant_id,
                epoch_id,
                ST_AsGeoJSON({geom_sql}) AS geometry,
                ST_Area(ST_Transform(geom, 3857)) AS area
            FROM site_features
            WHERE tenant_id = %s
            AND epoch_id BETWEEN %s AND %s;
            """
            
            
    cursor.execute(query, (tenant_id, start_epoch, end_epoch))
    rows = cursor.fetchall()
    
    
    features = []
    
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "tenant_id": row[0],
                "epoch_id": row[1],
                "area_sqm": row[3]
            },
            "geometry": json.loads(row[2])
        })


    return {
        "type": "FeatureCollection",
        "features": features
    }

