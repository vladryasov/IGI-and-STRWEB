/**
 * API геолокации
 * Определение местоположения пользователя и отображение на карте
 */

class GeolocationAPI {
    constructor() {
        this.map = null;
        this.marker = null;
        this.init();
    }

    init() {
        const getLocationBtn = document.getElementById('get-location-btn');
        if (getLocationBtn) {
            getLocationBtn.addEventListener('click', () => this.getUserLocation());
        }
    }

    getUserLocation() {
        const resultDiv = document.getElementById('geolocation-result');
        const mapDiv = document.getElementById('map-container');
        
        if (!resultDiv) return;

        if (!navigator.geolocation) {
            resultDiv.innerHTML = '<div class="error-message">Геолокация не поддерживается вашим браузером</div>';
            return;
        }

        resultDiv.innerHTML = '<div class="loading-message">Определение местоположения...</div>';

        navigator.geolocation.getCurrentPosition(
            (position) => this.showLocation(position, resultDiv, mapDiv),
            (error) => this.handleError(error, resultDiv)
        );
    }

    showLocation(position, resultDiv, mapDiv) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        resultDiv.innerHTML = `
            <div class="location-info">
                <h3>Ваше местоположение</h3>
                <p><strong>Широта:</strong> ${latitude.toFixed(6)}°</p>
                <p><strong>Долгота:</strong> ${longitude.toFixed(6)}°</p>
                <p><strong>Точность:</strong> ±${Math.round(accuracy)} метров</p>
                <p><strong>Время определения:</strong> ${new Date().toLocaleString('ru-RU')}</p>
            </div>
        `;

        // Отображаем на карте (используем Leaflet через CDN)
        if (mapDiv) {
            this.showMap(latitude, longitude, mapDiv);
        }
    }

    showMap(lat, lng, container) {
        // Используем OpenStreetMap через Leaflet
        if (typeof L === 'undefined') {
            // Загружаем Leaflet если не загружен
            this.loadLeaflet(() => this.initMap(lat, lng, container));
        } else {
            this.initMap(lat, lng, container);
        }
    }

    loadLeaflet(callback) {
        // Загружаем Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Загружаем Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    initMap(lat, lng, container) {
        if (this.map) {
            this.map.remove();
        }

        container.innerHTML = '<div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>';
        
        this.map = L.map('map').setView([lat, lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.marker = L.marker([lat, lng]).addTo(this.map)
            .bindPopup('Ваше местоположение')
            .openPopup();
    }

    handleError(error, resultDiv) {
        let message = 'Ошибка определения местоположения: ';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message += 'Пользователь отклонил запрос на геолокацию';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Информация о местоположении недоступна';
                break;
            case error.TIMEOUT:
                message += 'Время ожидания запроса истекло';
                break;
            default:
                message += 'Неизвестная ошибка';
                break;
        }
        resultDiv.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('get-location-btn')) {
        new GeolocationAPI();
    }
});

