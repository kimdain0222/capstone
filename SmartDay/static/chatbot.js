document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('input-form');
    form.addEventListener('submit', sendMessage);
});

async function sendMessage(event) {
    event.preventDefault();

    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message) return; 

    const chatBox = document.getElementById('chat-box');
    
    // 사용자의 메시지를 화면에 표시
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `<p>${message}</p>`;
    chatBox.appendChild(userMessageDiv);
    
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // 백엔드 API로 메시지를 보내고 응답을 받음
    try {
        const response = await fetch('/chatbot/chat-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ request_message: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 챗봇의 응답 메시지를 화면에 표시
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        botMessageDiv.innerHTML = `<p>${data.response_message}</p>`;
        chatBox.appendChild(botMessageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error('Error:', error);
        // 오류 발생 시 사용자에게 알림
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'message bot-message';
        errorMessageDiv.innerHTML = `<p>오류가 발생했습니다. 다시 시도해주세요.</p>`;
        chatBox.appendChild(errorMessageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}