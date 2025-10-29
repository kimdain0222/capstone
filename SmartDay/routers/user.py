from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserLogin, UserResponse
from utils.security import hash_password, verify_password
from utils.auth import create_access_token, logout_token, bearer_scheme
from config import KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI, KAKAO_USER_INFO_URL, KAKAO_AUTH_TOKEN_URL
import httpx
from pydantic import BaseModel

router = APIRouter()

@router.post("/signup/", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")
    hashed_pw = hash_password(user.password)
    new_user = User(email=user.email, username=user.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login/")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not db_user.hashed_password or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout/")
def logout(token=Depends(bearer_scheme)):
    logout_token(token.credentials)
    return {"message": "로그아웃 되었습니다. 토큰이 무효화되었습니다."}

# 프론트엔드에 카카오 설정 정보를 전달하는 API
@router.get("/kakao/config")
def get_kakao_config():
    return {
        "rest_api_key": KAKAO_REST_API_KEY,
        "redirect_uri": KAKAO_REDIRECT_URI
    }

# 프론트엔드에서 받은 인가 코드를 담을 모델
class KakaoCode(BaseModel):
    code: str

@router.post("/kakao/login")
async def kakao_login(kakao_code: KakaoCode, db: Session = Depends(get_db)):
    code = kakao_code.code
    
    # 인가 코드로 카카오에 액세스 토큰 요청
    token_url = KAKAO_AUTH_TOKEN_URL
    token_data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_REST_API_KEY,
        "redirect_uri": KAKAO_REDIRECT_URI,
        "code": code,
    }
    
    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            token_json = token_response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=400, detail=f"카카오 토큰 발급 실패: {e.response.text}")

    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="카카오 응답에 액세스 토큰이 없습니다.")

    # 액세스 토큰으로 사용자 정보 요청
    user_info_url = KAKAO_USER_INFO_URL
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        try:
            user_info_response = await client.get(user_info_url, headers=headers)
            user_info_response.raise_for_status()
            user_info_json = user_info_response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=400, detail=f"카카오 사용자 정보 조회 실패: {e.response.text}")
            
    kakao_id = str(user_info_json.get("id"))
    kakao_account = user_info_json.get("kakao_account", {})
    email = kakao_account.get("email")
    nickname = kakao_account.get("profile", {}).get("nickname", "카카오사용자")

    if not kakao_id:
        raise HTTPException(status_code=500, detail="카카오 사용자 ID를 가져올 수 없습니다.")

    # DB에서 사용자 조회 또는 신규 생성
    db_user = db.query(User).filter(User.kakao_id == kakao_id).first()

    if not db_user:
        if email and db.query(User).filter(User.email == email).first():
            raise HTTPException(
                status_code=400, 
                detail=f"'{email}' 이메일은 이미 가입되어 있습니다. 기존 계정으로 로그인해주세요."
            )
        
        new_user = User(
            email=email if email else f"{kakao_id}@kakao.user",
            username=nickname,
            kakao_id=kakao_id,
            hashed_password=None
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db_user = new_user

    # 우리 서비스의 JWT 액세스 토큰 생성 및 반환
    service_access_token = create_access_token(data={"sub": db_user.email})
    
    return {"access_token": service_access_token, "token_type": "bearer"}
