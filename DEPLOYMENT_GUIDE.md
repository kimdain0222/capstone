# SmartDay 프로젝트 배포 가이드

이 문서는 SmartDay 프로젝트를 Netlify와 Railway에 배포하는 방법을 설명합니다.

## 프로젝트 구조

```
Capstone-master/
├── SmartDay/          # 메인 애플리케이션 (FastAPI + Streamlit)
├── backend/           # 백엔드 API (FastAPI)
├── frontend/          # 프론트엔드 (Streamlit)
├── ai/               # AI 관련 모듈
└── netlify/          # Netlify Functions
```

## 1. Railway 배포 (권장)

Railway는 FastAPI 애플리케이션을 배포하기에 가장 적합합니다.

### 1.1 Railway 계정 생성 및 프로젝트 연결

1. [Railway.app](https://railway.app)에 가입
2. GitHub 계정 연결
3. "New Project" → "Deploy from GitHub repo" 선택
4. 이 저장소 선택

### 1.2 환경변수 설정

Railway 대시보드에서 다음 환경변수들을 설정하세요:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
TAVILY_API_KEY=your-tavily-api-key
```

### 1.3 배포 설정

- **Build Command**: `pip install -r SmartDay/requirements.txt`
- **Start Command**: `uvicorn SmartDay.main:app --host 0.0.0.0 --port $PORT`
- **Root Directory**: `SmartDay/`

### 1.4 데이터베이스 설정

Railway에서 PostgreSQL 데이터베이스를 추가하고 연결하세요:

1. Railway 대시보드에서 "Add Service" → "Database" → "PostgreSQL" 선택
2. 생성된 데이터베이스의 연결 정보를 `DATABASE_URL`에 설정

## 2. Netlify 배포

Netlify는 정적 사이트와 서버리스 함수를 지원합니다.

### 2.1 Netlify 계정 생성 및 프로젝트 연결

1. [Netlify.com](https://netlify.com)에 가입
2. "New site from Git" 선택
3. GitHub 저장소 연결

### 2.2 빌드 설정

- **Build Command**: `echo "Static site build completed"`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`

### 2.3 환경변수 설정

Netlify 대시보드에서 다음 환경변수들을 설정하세요:

```bash
OPENAI_API_KEY=your-openai-api-key
TAVILY_API_KEY=your-tavily-api-key
```

## 3. Docker를 사용한 로컬 테스트

### 3.1 Docker 이미지 빌드

```bash
# SmartDay 애플리케이션
docker build -t smartday-app .

# 백엔드만
docker build -f backend/Dockerfile -t smartday-backend ./backend

# 프론트엔드만
docker build -f frontend/Dockerfile -t smartday-frontend ./frontend
```

### 3.2 Docker 컨테이너 실행

```bash
# SmartDay 애플리케이션 실행
docker run -p 8000:8000 --env-file .env smartday-app

# 백엔드 실행
docker run -p 8000:8000 --env-file .env smartday-backend

# 프론트엔드 실행
docker run -p 8501:8501 --env-file .env smartday-frontend
```

## 4. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# env.example 파일을 복사하여 .env 파일 생성
cp env.example .env
```

그 후 `.env` 파일에서 실제 값들로 수정하세요.

## 5. 배포 후 확인사항

### 5.1 Railway 배포 확인

1. Railway에서 제공하는 URL로 접속
2. API 엔드포인트 테스트: `https://your-app.railway.app/docs`
3. 데이터베이스 연결 확인

### 5.2 Netlify 배포 확인

1. Netlify에서 제공하는 URL로 접속
2. 서버리스 함수 테스트: `https://your-app.netlify.app/.netlify/functions/hello`

## 6. 문제 해결

### 6.1 일반적인 문제

1. **포트 문제**: Railway는 `$PORT` 환경변수를 사용하므로 코드에서 이를 참조해야 합니다.
2. **데이터베이스 연결**: PostgreSQL 연결 문자열 형식을 확인하세요.
3. **의존성 문제**: `requirements.txt`에 모든 필요한 패키지가 포함되어 있는지 확인하세요.

### 6.2 로그 확인

- **Railway**: 대시보드의 "Deployments" 탭에서 로그 확인
- **Netlify**: 대시보드의 "Functions" 탭에서 로그 확인

## 7. 추가 설정

### 7.1 도메인 설정

- **Railway**: Custom Domain 설정 가능
- **Netlify**: Custom Domain 설정 가능

### 7.2 SSL 인증서

두 플랫폼 모두 자동으로 SSL 인증서를 제공합니다.

## 8. 모니터링 및 유지보수

### 8.1 성능 모니터링

- Railway: 내장된 메트릭 대시보드 사용
- Netlify: Analytics 탭에서 트래픽 분석

### 8.2 자동 배포

GitHub에 코드를 푸시하면 자동으로 재배포됩니다.

---

## 지원

문제가 발생하면 다음을 확인하세요:

1. 환경변수 설정이 올바른지
2. 데이터베이스 연결이 정상인지
3. 의존성 패키지가 모두 설치되었는지
4. 포트 설정이 올바른지

추가 도움이 필요하면 프로젝트 이슈를 생성해 주세요.
