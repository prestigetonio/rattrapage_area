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
        user = models.User(email=primary_email, hashed_password="OAUTH_GITHUB_USER", github_token=access_token)
        db.add(user)
    else:
        user.github_token = access_token
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

@app.get("/user/service-status")
async def get_service_status(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email.lower()).first()    
    if not user:
        return {"github_connected": False}
    is_connected = user.github_token is not None and user.github_token != ""
    return {"github_connected": is_connected}

@app.get("/github/repos")
async def get_github_repos(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email.lower()).first()
    if not user or not user.github_token:
        raise HTTPException(status_code=401, detail="Non connecté à GitHub")
    
    async with httpx.AsyncClient() as client:
        try:
            repos_res = await client.get(
                "https://api.github.com/user/repos",
                headers={"Authorization": f"Bearer {user.github_token}"},
                params={"sort": "updated", "per_page": 10}
            )
            if repos_res.status_code != 200:
                raise HTTPException(status_code=repos_res.status_code, detail="erreur API github")
            
            repos = repos_res.json()
            return [{"id": r["id"], "name": r["name"], "url": r["html_url"]} for r in repos]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")

@app.post("/github/reaction")
async def create_github_repo(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    user = db.query(models.User).filter(models.User.email == email.lower()).first()
    if not user or not user.github_token:
        raise HTTPException(status_code=401, detail="non connecté à github")
    
    async with httpx.AsyncClient() as client:
        try:
            create_res = await client.post(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {user.github_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                json={
                    "name": "Areatest",
                    "description": "rep créé via AREA",
                    "private": False
                }
            )
            if create_res.status_code == 201:
                return {"status": "success", "message": "dépot créé !"}
            elif create_res.status_code == 422:
                return {"status": "info", "message": "dépôt existe"}
            else:
                raise HTTPException(status_code=create_res.status_code, detail="erreur crée")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
        