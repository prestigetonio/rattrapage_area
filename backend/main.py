from fastapi import FastAPI
from db.database import engine, Base
from db import models

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Backend is running and DB is connected"}
