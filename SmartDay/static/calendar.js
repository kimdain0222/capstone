document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.parent.location.href = '/login';
        return;
    }

    // 전역 변수 및 요소
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let selectedDate = null;
    let dailyEvents = [];
    let currentPage = 1;
    const eventsPerPage = 5;
    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const calendarTitle = document.getElementById('calendar-title');
    const calendarBody = document.getElementById('calendar-body');
    const eventListTitle = document.getElementById('event-list-title');
    const eventList = document.getElementById('event-list');
    
    const modal = document.getElementById('event-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const startTimeSelect = document.getElementById('start-time');
    const endTimeSelect = document.getElementById('end-time');
    const memoTextarea = document.getElementById('memo-textarea');
    const saveMemoBtn = document.getElementById('save-memo-btn');
    const modalErrorMsg = document.getElementById('modal-error-msg');

    function openModal(dateStr) {
        selectedDate = dateStr;
        modalTitle.textContent = `${dateStr} 일정 추가`;
        memoTextarea.value = '';
        modalErrorMsg.textContent = '';
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modalErrorMsg.textContent = '';
        modal.classList.add('hidden');
    }

    async function handleDateClick(dateStr, dateSpan) {
        document.querySelectorAll('.day-cell.selected').forEach(el => el.classList.remove('selected'));
        dateSpan.classList.add('selected');
        selectedDate = dateStr;
        eventListTitle.textContent = `${dateStr} 일정 목록`;
        await fetchAndDisplayDailyEvents(dateStr);
    }
    
    function renderCalendar(year, month) {
        calendarBody.innerHTML = '';
        calendarTitle.textContent = `${year}년 ${month + 1}월`;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        for (let date = 1; date <= 31; date++) {
            const dateCellWrapper = document.createElement('div');
            dateCellWrapper.className = 'day-cell-wrapper';
            const dateSpan = document.createElement('span');
            dateSpan.textContent = date;
            dateSpan.className = 'day-cell';
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            if (dateStr === todayStr) dateSpan.classList.add('today');
            if(dateStr === selectedDate) dateSpan.classList.add('selected');
            
            dateSpan.onclick = () => {
                handleDateClick(dateStr, dateSpan);
                openModal(dateStr); 
            };
            
            dateCellWrapper.appendChild(dateSpan);
            calendarBody.appendChild(dateCellWrapper);
        }
    }

    function renderEventList() {
        eventList.innerHTML = '';
        const totalPages = Math.ceil(dailyEvents.length / eventsPerPage);
        if (dailyEvents.length === 0) {
            eventList.innerHTML = `<p class="text-gray-500">선택된 날짜에 일정이 없습니다.</p>`;
            document.getElementById('page-info').textContent = '';
            document.getElementById('prev-page-btn').disabled = true;
            document.getElementById('next-page-btn').disabled = true;
            return;
        }
        document.getElementById('page-info').textContent = `${currentPage} / ${totalPages}`;
        document.getElementById('prev-page-btn').disabled = currentPage === 1;
        document.getElementById('next-page-btn').disabled = currentPage === totalPages;

        const paginatedEvents = dailyEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);
        paginatedEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-item p-3 bg-blue-50 rounded-lg border border-blue-200 transition cursor-pointer hover:bg-blue-100';
            eventEl.dataset.eventId = event.id;
            eventEl.innerHTML = `<p class="font-bold text-blue-800 pointer-events-none">${event.start_time} - ${event.end_time}</p><p class="text-gray-700 pointer-events-none">${event.title}</p>`;
            
            eventEl.addEventListener('contextmenu', (e) => {
                e.preventDefault(); 
                if (confirm(`'${event.title}' 일정을 삭제하시겠습니까?`)) {
                    deleteEvent(event.id);
                }
            });
            
            eventList.appendChild(eventEl);
        });
    }

    async function fetchAndDisplayDailyEvents(dateStr) {
        try {
            const response = await fetch(`/calendar/daily/?date=${dateStr}`, { headers: authHeaders });
            if (!response.ok) throw new Error('Network response was not ok');
            dailyEvents = await response.json();
            currentPage = 1;
            renderEventList();
        } catch(error) {
            console.error('일일 일정 로딩 실패:', error);
            eventList.innerHTML = `<p class="text-red-500">일정을 불러오는 데 실패했습니다.</p>`;
        }
    }
    
    async function deleteEvent(eventId) {
        try {
            const response = await fetch(`/calendar/${eventId}/`, {
                method: 'DELETE',
                headers: authHeaders
            });

            if (!response.ok) {
                throw new Error('Server responded with an error.');
            }
            
            await fetchAndDisplayDailyEvents(selectedDate);

        } catch (error) {
            console.error('일정 삭제 실패:', error);
            alert('일정 삭제에 실패했습니다. 다시 시도해 주세요.');
        }
    }

    function generateTimeOptions() {
        for (let i = 0; i < 24; i++) {
            const time = `${String(i).padStart(2, '0')}:00`;
            startTimeSelect.add(new Option(time, time));
            endTimeSelect.add(new Option(time, time));
        }
        startTimeSelect.value = "09:00";
        endTimeSelect.value = "10:00";
    }

    // 이벤트 리스너
    document.getElementById('prev-month-btn').onclick = () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentYear, currentMonth);
    };
    document.getElementById('next-month-btn').onclick = () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentYear, currentMonth);
    };

    document.getElementById('prev-page-btn').onclick = () => { if(currentPage > 1) { currentPage--; renderEventList(); } };
    document.getElementById('next-page-btn').onclick = () => { if(currentPage < Math.ceil(dailyEvents.length / eventsPerPage)) { currentPage++; renderEventList(); } };
    
    closeModalBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    
    saveMemoBtn.onclick = async () => {
        modalErrorMsg.textContent = '';
        
        if (!memoTextarea.value.trim()) {
            modalErrorMsg.textContent = '일정 내용을 입력해주세요.';
            return;
        }

        try {
            const response = await fetch('/calendar/', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    date: selectedDate,
                    title: memoTextarea.value.trim(),
                    start_time: startTimeSelect.value,
                    end_time: endTimeSelect.value
                })
            });
            if (!response.ok) throw new Error('Save failed');
            
            closeModal();
            await fetchAndDisplayDailyEvents(selectedDate);
        } catch(error) {
            console.error('일정 저장 실패:', error);
            modalErrorMsg.textContent = '서버 오류: 일정 저장에 실패했습니다.';
        }
    };

    // --- 초기화 ---
    generateTimeOptions();
    renderCalendar(currentYear, currentMonth);
});