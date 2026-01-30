from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db.database import engine, get_db
from db import models
from auth_utils import hash_password, verify_password
from dotenv import load_dotenv
import schemas
import os
import httpx

load_dotenv()

GITHUB_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/github")
async def github_auth(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://github.com/login/oauth/access_token",
            params={
                "client_id": GITHUB_ID,
                "client_secret": GITHUB_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        user_res = await client.get("https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        emails = user_res.json()
        primary_email = next(e['email'] for e in emails if e['primary'])
    user = db.query(models.User).filter(models.User.email == primary_email).first()
    if not user:
        user = models.User(email=primary_email, hashed_password="OAUTH_GITHUB_USER")
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"status": "success", "email": user.email}

@app.post("/register")
def register(user: schemas.UserAuth, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="email déjà utilisé")
    hashed_pwd = hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "user": new_user.email}

@app.post("/login")
def login(user: schemas.UserAuth, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="email ou mdp incorrect")
    return {"status": "success", "message": "connecté !"}
