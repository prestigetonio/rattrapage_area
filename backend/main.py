from fastapi import FastAPI
from db.database import engine, Base
from db import models

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Backend is running and DB is connected"}
