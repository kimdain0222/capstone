# SmartDay 프로젝트 배포 가이드



## 프로젝트 구조

```
Capstone-master/
├── SmartDay/          # 메인 애플리케이션 (FastAPI + Streamlit)
├── backend/           # 백엔드 API (FastAPI)
├── frontend/          # 프론트엔드 (Streamlit)
├── ai/               # AI 관련 모듈
└── netlify/          # Netlify Functions
```

## 1. Railway 배포

Railway는 FastAPI 애플리케이션을 배포하기에 가장 적합합니다.

### 1.1 Railway 계정 생성 및 프로젝트 연결

1. [Railway.app](https://railway.app)에 가입
2. GitHub 계정 연결
3. "New Project" → "Deploy from GitHub repo" 선택
4. 이 저장소 선택



Railway Variables 탭에서 환경변수 설정:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
TAVILY_API_KEY=your-tavily-api-key
```

### 배포 설정

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn SmartDay.main:app --host 0.0.0.0 --port $PORT`
- **Root Directory**: `SmartDay/`

### 데이터베이스 설정

Railway에서 PostgreSQL 데이터베이스를 추가&연결결

1. Railway 대시보드에서 "Add Service" → "Database" → "PostgreSQL" 선택
2. 생성된 데이터베이스의 연결 정보를 `DATABASE_URL`에 설정

## 2. Netlify 배포

Netlify는 정적 사이트와 서버리스 함수 지원

###  Netlify 계정 생성 및 프로젝트 연결

1. [Netlify.com](https://netlify.com)에 가입
2. "New site from Git" 선택
3. GitHub 저장소 연결

### 빌드 설정

- **Build Command**: `echo "Static site build completed"`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`

### 환경변수 설정

Netlify 대시보드에서 환경변수 설정정

```bash
OPENAI_API_KEY=your-openai-api-key
TAVILY_API_KEY=your-tavily-api-key
```

## 3. Docker를 사용한 로컬 테스트

### Docker 이미지 빌드

```bash
# SmartDay 애플리케이션
docker build -t smartday-app .

# 백엔드만
docker build -f backend/Dockerfile -t smartday-backend ./backend

# 프론트엔드만
docker build -f frontend/Dockerfile -t smartday-frontend ./frontend
```

### Docker 컨테이너 실행

```bash
# SmartDay 애플리케이션 실행
docker run -p 8000:8000 --env-file .env smartday-app

# 백엔드 실행
docker run -p 8000:8000 --env-file .env smartday-backend

# 프론트엔드 실행
docker run -p 8501:8501 --env-file .env smartday-frontend
```

## 4. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하시길길

```bash
# env.example 파일을 복사하여 .env 파일 생성
cp env.example .env
```

그 후 `.env` 파일에서 실제 값들로 수정하면 됨됨

## 5. 배포 후 확인사항

### Railway 배포 확인

1. Railway에서 제공하는 URL로 접속
2. API 엔드포인트 테스트: `https://your-app.railway.app/docs`
3. 데이터베이스 연결 확인

### Netlify 배포 확인

1. Netlify에서 제공하는 URL로 접속
2. 서버리스 함수 테스트: `https://your-app.netlify.app/.netlify/functions/hello`

### +) 깃과 각각의 배포 사이트 연결하면 깃에 코드 수정 올릴떄마다 자동으로 수정됨됨