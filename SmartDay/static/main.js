document.addEventListener("DOMContentLoaded", function() {
    if (!localStorage.getItem('accessToken')) {
        window.location.href = '/login';
        return;
    }
    
    const contentFrame = document.getElementById('content-frame');
    const buttons = {
        chatbot: document.getElementById('chatbot-btn'),
        calendar: document.getElementById('calendar-btn'),
        map: document.getElementById('map-btn'),
        logout: document.getElementById('logout-btn')
    };

    function setActiveView(viewName) {
        if (viewName === 'chatbot') {
            contentFrame.src = '/chatbot';
        } else if (viewName === 'map') {
            contentFrame.src = '/map';
        } else if (viewName === 'calendar') {
            contentFrame.src = '/calendar';
        }

        // 모든 버튼의 활성화 스타일 제거
        Object.values(buttons).forEach(button => {
            if (button.id !== 'logout-btn') {
                button.classList.remove('bg-[var(--primary-color)]/20', 'text-[var(--primary-color)]', 'font-bold');
                button.classList.add('text-stone-600', 'font-medium');
            }
        });

        // 클릭한 버튼에만 활성화 스타일 추가
        if (buttons[viewName]) {
            // 선택된 버튼에서만 기본 스타일을 변경
            buttons[viewName].classList.remove('text-stone-600', 'font-medium');
            buttons[viewName].classList.add('bg-[var(--primary-color)]/20', 'text-[var(--primary-color)]', 'font-bold');
        }
    }

    // 버튼 클릭 이벤트 리스너
    buttons.chatbot.addEventListener('click', () => setActiveView('chatbot'));
    buttons.calendar.addEventListener('click', () => setActiveView('calendar'));
    buttons.map.addEventListener('click', () => setActiveView('map'));

    // 로그아웃 버튼 이벤트
    buttons.logout.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    });
    setActiveView('chatbot');
});

