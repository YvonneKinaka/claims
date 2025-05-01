from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle 
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text
from sqlalchemy.orm import sessionmaker, declarative_base
import json
from typing import List
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import ForeignKey

# Initialize FastAPI
app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
model = pickle.load(open("claims_final.sav", "rb"))
feature_names = [
    'months_as_customer', 'age', 'time_difference', 'claim_type',
    'total_claim_amount', 'insured_sex', 'insured_education_level',
    'policy_annual_premium', 'umbrella_limit', 'vehicle_claim',
    'time_since_policy_activation', 'claim_frequency', 'claim_size_ratio',
    'claim_type_frequency', 'average_claim_amount_last_12_months',
    'claim_flag', 'policy_bind_year', 'policy_bind_month',
    'policy_bind_day', 'policy_bind_dayofweek', 'policy_bind_is_weekend',
    'policy_bind_quarter', 'incident_year', 'incident_month',
    'incident_day', 'incident_dayofweek', 'incident_is_weekend',
    'incident_quarter', 'days_between_policy_and_incident'
]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Secret
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database setup
DATABASE_URL = "sqlite:///./claims.db"  # You can change to PostgreSQL/MySQL later

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


# Pydantic schemas
class ClaimInput(BaseModel):
    client_name: str
    months_as_customer: float
    age: float
    time_difference: float
    claim_type: int
    total_claim_amount: float
    insured_sex: int
    insured_education_level: int
    policy_annual_premium: float
    umbrella_limit: float
    vehicle_claim: float
    time_since_policy_activation: float
    claim_frequency: int
    claim_size_ratio: float
    claim_type_frequency: float
    average_claim_amount_last_12_months: float
    claim_flag: int
    policy_bind_year: int
    policy_bind_month: int
    policy_bind_day: int
    policy_bind_dayofweek: int
    policy_bind_is_weekend: int
    policy_bind_quarter: int
    incident_year: int
    incident_month: int
    incident_day: int
    incident_dayofweek: int
    incident_is_weekend: int
    incident_quarter: int
    days_between_policy_and_incident: int

class ManagerDecisionInput(BaseModel):
    claim_id: int
    decision: str  # 'approved' or 'rejected'

class ClaimOfficerReview(BaseModel):
    claim_id: int
    comments: str

class ClaimOfficerRetrieve(BaseModel):
    claim_id: int

class ClaimOut(BaseModel):
    id: int
    claim_data: str
    claim_officer_reviewed: bool

    class Config:
        orm_mode = True

class ManagerClaimOut(BaseModel):
    id: int
    client_name: str
    claim_data: str
    claim_officer_comments: str
    prediction: int

    class Config:
        orm_mode = True

# User Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(String)  # client, officer, manager

class RegisterInput(BaseModel):
    username: str
    password: str
    role: str  # 'client', 'officer', or 'manager'

# Database models
class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"))
    client_name = Column(String)
    claim_data = Column(String)
    prediction = Column(Integer, nullable=True)  # Not predicted until officer approves
    manager_decision = Column(String, nullable=True)
    feedback_sent = Column(Boolean, default=False)
    claim_officer_reviewed = Column(Boolean, default=False)
    claim_officer_comments = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return {"username": username, "role": role}

# Routes
@app.post("/submit_claim")
def submit_claim(claim: ClaimInput, user: dict = Depends(get_current_user)):
    if user["role"] != "client":
        raise HTTPException(status_code=403, detail="Only clients can submit claims.")
    
    db = SessionLocal()
    user_obj = db.query(User).filter(User.username == user["username"]).first()  # ✅ Fetch user..

    db_claim = Claim(
        client_id=user_obj.id,                # ✅ Save client_id
        client_name=user_obj.username,
        claim_data=claim.json(),
    )

    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    db.close()
    
    return {"claim_id": db_claim.id, "Status": "Submitted"}


@app.post("/officer_retrieve", response_model=List[ClaimOut])
def officer_retrieve(user: dict = Depends(get_current_user)):
    if user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Only officers can access this page.")
    db = SessionLocal()
    
    claims = db.query(Claim).filter(Claim.claim_officer_reviewed == False).all()

    if not claims:
        db.close()
        raise HTTPException(status_code=404, detail="No claims found.")

    db.close()

    return claims


@app.post("/officer_review")
def officer_review(review: ClaimOfficerReview, user: dict = Depends(get_current_user)):
    if user["role"] != "officer":
        raise HTTPException(status_code=403, detail="Only a officer can access this page.")
    db = SessionLocal()
    claim = db.query(Claim).filter(Claim.id == review.claim_id).first()

    if not claim:
        db.close()
        raise HTTPException(status_code=404, detail="Claim not found.")
    
    # Mark as reviewed and add comments
    claim.claim_officer_reviewed = True
    claim.claim_officer_comments = review.comments

    # Load input data properly
    input_dict = json.loads(claim.claim_data)
    # Remove 'client_name' key using pop
    input_dict.pop("client_name", None)
    input_df = pd.DataFrame([input_dict.values()], columns=feature_names)

    # Make prediction
    prediction = model.predict(input_df[feature_names])[0]
    claim.prediction = int(prediction)

    db.commit()
    db.close()

    return {"message": "Claim Officer reviewed and prediction done.", "fraud_prediction": int(prediction)}

@app.post("/manager_retrieve", response_model=List[ManagerClaimOut])
def manager_retrieve( user: dict = Depends(get_current_user)):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only a manager can access this page.")
    db = SessionLocal()
    # Get claims that have been reviewed by officer (prediction is not null) and waiting for manager
    claims = db.query(Claim).filter(
        Claim.claim_officer_reviewed == True,
        Claim.manager_decision == None
    ).all()

    db.close()

    return claims

@app.post("/manager_decision")
def manager_decision(decision_data: ManagerDecisionInput, user: dict = Depends(get_current_user)):
    if user["role"] != "manager":
        raise HTTPException(status_code=403, detail="Only managers can access this page.")

    db = SessionLocal()
    claim = db.query(Claim).filter(Claim.id == decision_data.claim_id).first()
    
    if not claim:
        db.close()
        raise HTTPException(status_code=404, detail="Claim not found.")
    
    claim.manager_decision = decision_data.decision
    claim.feedback_sent = True
    db.commit()
    db.close()
    
    return {"message": "Manager decision recorded."}

@app.get("/get_claim_feedback/{claim_id}")
def get_claim_feedback(claim_id: int):
    db = SessionLocal()
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        db.close()
        raise HTTPException(status_code=404, detail="Claim not found.")
    
    if not claim.feedback_sent:
        db.close()
        return {"message": "Feedback not ready yet."}
    
    db.close()
    return {
        "client_name": claim.client_name,
        "fraud_prediction": claim.prediction,
        "manager_decision": claim.manager_decision
    }


@app.post("/register")
def register(user: RegisterInput):
    db = SessionLocal()

    user.username = user.username.strip().lower()

    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        db.close()
        raise HTTPException(status_code=400, detail="Username already registered.")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # 👈 this gets the ID
    db.close()
    return {"message": "User registered successfully."}


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    user = db.query(User).filter(User.username == form_data.username).first()
    db.close()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/history")
def get_history(user: dict = Depends(get_current_user)):
    db = SessionLocal()

    if user["role"] == "client":
        # For clients, show only their own claims
        claims = db.query(Claim).filter(Claim.client_name == user["username"]).all()
    else:
        # For officer and manager, show all claims
        claims = db.query(Claim).all()

    db.close()

    history = []
    for claim in claims:
        record = {
            "id": claim.id,
            "client_name": claim.client_name,
            "manager_decision": claim.manager_decision,
            "claim_data": claim.claim_data,
        }
        if user["role"] in ["officer", "manager"]:
            record["prediction"] = claim.prediction
        history.append(record)

    return history

@app.get("/user_claim_stats")
def get_user_stats(user: dict = Depends(get_current_user)):
    db = SessionLocal()

    print(f"JWT Token Payload: {user}")  # Log the user info from the JWT token
    user_obj = db.query(User).filter(User.username == user["username"]).first()

    try:
        user_claims = db.query(Claim).filter(Claim.client_id == user_obj.id).all()
        db.close()

        total = len(user_claims)
        pending = len([c for c in user_claims if c.manager_decision is None])
        approved = len([c for c in user_claims if c.manager_decision == "approved"])
        rejected = len([c for c in user_claims if c.manager_decision == "rejected"])

    except:
        db.close()
        total = 0
        pending = 0
        approved = 0
        rejected = 0

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }
