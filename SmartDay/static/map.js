kakao.maps.load(function() {
    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error("Map container not found!");
            return;
        }
        const mapOption = {
            center: new kakao.maps.LatLng(37.339038, 126.736138),
            level: 8
        };
        window.map = new kakao.maps.Map(mapContainer, mapOption);
        const zoomControl = new kakao.maps.ZoomControl();
        window.map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
    } catch (error) {
        console.error("Failed to create Kakao Map object:", error);
        alert("지도를 불러오는 데 실패했습니다. API 키 또는 네트워크 연결을 확인하세요.");
    }
});

let markers = [];
let infowindows = [];

async function loadMarkers(type, clickedButton) {
    if (!window.map) {
        alert("지도가 아직 로드되지 않았습니다.");
        return;
    }

    document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    markers.forEach(marker => marker.setMap(null));
    infowindows.forEach(infowindow => infowindow.close());
    markers = [];
    infowindows = [];

    const apiUrl = `/map/${type}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data || data.length === 0) {
            alert('표시할 데이터가 없습니다.');
            if (clickedButton) clickedButton.classList.remove('active');
            return;
        }

        data.forEach(item => {
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(item.lat, item.lng),
            });

            const content = `
                <div class="infowindow-content">
                    <strong>${item.name}</strong>
                    전화번호: ${item.tel || '정보 없음'}
                </div>`;

            const infowindow = new kakao.maps.InfoWindow({ content: content, disableAutoPan: true });

            kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(window.map, marker));
            kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
            
            marker.setMap(window.map);
            markers.push(marker);
            infowindows.push(infowindow);
        });

    } catch (error) {
        console.error('Error loading markers:', error);
        alert('마커 데이터를 불러오는 중 오류가 발생했습니다.');
        if (clickedButton) clickedButton.classList.remove('active');
    }
}