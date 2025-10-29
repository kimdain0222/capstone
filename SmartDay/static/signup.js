document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const messageContainer = document.getElementById('message-container');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageContainer.innerHTML = '';

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/user/signup/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                messageContainer.innerHTML = `<div class="alert alert-success">회원가입에 성공했습니다! 3초 후 로그인 페이지로 이동합니다.</div>`;
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                const errorMessage = data.detail || '회원가입에 실패했습니다.';
                messageContainer.innerHTML = `<div class="alert alert-error">${errorMessage}</div>`;
            }
        } catch (error) {
            console.error('An error occurred during the signup request:', error);
            messageContainer.innerHTML = `<div class="alert alert-error">서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.</div>`;
        }
    });
});