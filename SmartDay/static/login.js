document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const errorMessageDiv = document.getElementById('error-message');
    const kakaoLoginBtn = document.getElementById('kakao-login-btn');

    // 기존 이메일/비밀번호 로그인 로직
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessageDiv.classList.add('hidden');
            const email = document.getElementById('email-address').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('/user/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password }),
                });
                const data = await response.json();
                if (response.ok) {
                    console.log('Login successful:', data);
                    localStorage.setItem('accessToken', data.access_token);
                    window.location.href = '/main';
                } else {
                    errorMessageDiv.textContent = data.detail || 'Login failed.';
                    errorMessageDiv.classList.remove('hidden');
                }
            } catch (error) {
                console.error('An error occurred during the login request:', error);
                errorMessageDiv.textContent = 'Cannot connect to the server. Please try again later.';
                errorMessageDiv.classList.remove('hidden');
            }
        });
    }

    // URL에서 인가 코드를 추출
    const urlParams = new URLSearchParams(window.location.search);
    const kakaoCode = urlParams.get('code');

    // 만약 URL에 인가 코드가 있다면, 백엔드로 로그인 요청을 보냄
    if (kakaoCode) {
        try {
            const response = await fetch('/user/kakao/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: kakaoCode }),
            });
            const data = await response.json();

            if (response.ok) {
                // 로그인 성공: 액세스 토큰 저장 후 메인 페이지로 이동
                localStorage.setItem('accessToken', data.access_token);
                window.location.href = '/main';
            } else {
                // 로그인 실패: 에러 메시지 표시
                errorMessageDiv.textContent = data.detail || '카카오 로그인에 실패했습니다.';
                errorMessageDiv.classList.remove('hidden');
                // URL에서 code 파라미터 제거하여 무한 루프 방지
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            console.error('카카오 로그인 처리 중 오류 발생:', error);
            errorMessageDiv.textContent = '서버와 통신 중 오류가 발생했습니다.';
            errorMessageDiv.classList.remove('hidden');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } 
    // URL에 인가 코드가 없다면, 카카오 로그인 버튼을 설정
    else if (kakaoLoginBtn) {
        try {
            // 백엔드에서 카카오 설정값(API 키, 리디렉션 URI)을 가져옴
            const response = await fetch('/user/kakao/config');
            if (!response.ok) {
                throw new Error('카카오 설정 정보를 가져오는 데 실패했습니다.');
            }
            const config = await response.json();
            
            const KAKAO_REST_API_KEY = config.rest_api_key;
            const KAKAO_REDIRECT_URI = config.redirect_uri;
            
            // 버튼 클릭 시 카카오 인증 페이지로 이동하도록 설정
            kakaoLoginBtn.addEventListener('click', () => {
                window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=&redirect_uri=&response_type=code`

            });

        } catch (error) {
            console.error("카카오 로그인 설정 실패:", error);
            // 사용자에게 설정 실패를 알림
            const kakaoBtnText = kakaoLoginBtn.querySelector('span');
            kakaoLoginBtn.disabled = true;
            if (kakaoBtnText) {
                kakaoBtnText.textContent = "카카오 로그인 사용 불가";
            }
            kakaoLoginBtn.style.backgroundColor = '#d1d5db';
            kakaoLoginBtn.style.cursor = 'not-allowed';
        }
    }
});