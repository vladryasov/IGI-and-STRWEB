/**
 * API геолокации
 * Определение местоположения пользователя и отображение на карте
 */

class GeolocationAPI {
    constructor() {
        this.map = null;
        this.marker = null;
        this._retryTried = false;
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

        // Упрощённый режим: определяем местоположение только по IP (без запросов разрешений),
        // потому что browser geolocation на Linux/Firefox часто возвращает POSITION_UNAVAILABLE.
        this.fetchApproxLocation(resultDiv, mapDiv);
    }

    async _renderPermissionInfo(resultDiv) {
        // Не все браузеры поддерживают Permissions API для geolocation
        try {
            if (!navigator.permissions?.query) return;
            const status = await navigator.permissions.query({ name: 'geolocation' });
            const state = status?.state;
            if (!state) return;
            // Добавляем небольшой блок состояния разрешения (не мешает основному UI)
            const info = document.createElement('div');
            info.className = 'muted';
            info.textContent = `Разрешение геолокации (browser): ${state}`;
            resultDiv.appendChild(info);
        } catch (_) {
            // ignore
        }
    }

    _getCurrentPositionWithOptions(options, resultDiv, mapDiv) {
        navigator.geolocation.getCurrentPosition(
            (position) => this.showLocation(position, resultDiv, mapDiv),
            (error) => this.handleError(error, resultDiv, mapDiv, options),
            options
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

    handleError(error, resultDiv, mapDiv, lastOptions) {
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

        // Иногда провайдер не может дать координаты при high accuracy.
        // Пробуем один раз повторить с более «мягкими» настройками.
        if (!this._retryTried && (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT)) {
            this._retryTried = true;
            resultDiv.innerHTML = `
                <div class="loading-message">
                    Перепробуем ещё раз (без высокой точности)...
                </div>
            `;
            this._renderPermissionInfo(resultDiv);
            this._getCurrentPositionWithOptions(
                { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
                resultDiv,
                mapDiv
            );
            return;
        }

        const details = (error && typeof error.message === 'string' && error.message.trim())
            ? `<div class="muted">Детали браузера: ${this.escapeHtml(error.message)}</div>`
            : '';

        const codeDetails = (typeof error?.code === 'number')
            ? `<div class="muted">Код ошибки: ${error.code}</div>`
            : '';

        const contextHint = (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname))
            ? `<div class="muted">Подсказка: геолокация требует HTTPS (кроме localhost).</div>`
            : '';

        const optionsHint = lastOptions
            ? `<div class="muted">Опции запроса: ${this.escapeHtml(JSON.stringify(lastOptions))}</div>`
            : '';

        resultDiv.innerHTML = `
            <div class="error-message">
                ${this.escapeHtml(message)}
                ${details}
                ${codeDetails}
                ${contextHint}
                ${optionsHint}
                <div class="muted">Если разрешение выдано, но координаты недоступны: проверьте, включены ли службы геолокации в ОС/браузере (на Linux часто зависит от GeoClue/Wi‑Fi).</div>
                <div style="margin-top:10px">
                    <button type="button" class="btn btn-secondary" id="geo-ip-fallback-btn">Определить приблизительно по IP</button>
                </div>
            </div>
        `;

        const fallbackBtn = document.getElementById('geo-ip-fallback-btn');
        if (fallbackBtn) {
            fallbackBtn.addEventListener('click', () => this.fetchApproxLocation(resultDiv, mapDiv));
        }
    }

    async fetchApproxLocation(resultDiv, mapDiv) {
        if (!resultDiv) return;
        resultDiv.innerHTML = '<div class="loading-message">Определяем приблизительное местоположение по IP...</div>';
        this._renderPermissionInfo(resultDiv);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
            // IP-based fallback (approximate). No backend required.
            const resp = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const lat = Number(data.latitude);
            const lon = Number(data.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('No lat/lon in response');

            resultDiv.innerHTML = `
                <div class="location-info">
                    <h3>Приблизительное местоположение (по IP)</h3>
                    <p><strong>Широта:</strong> ${lat.toFixed(6)}°</p>
                    <p><strong>Долгота:</strong> ${lon.toFixed(6)}°</p>
                    <p class="muted">Источник: IP‑геолокация (точность может быть низкой).</p>
                </div>
            `;
            if (mapDiv) {
                this.showMap(lat, lon, mapDiv);
            }
        } catch (e) {
            const errText = (e && e.name === 'AbortError') ? 'Таймаут запроса' : (e?.message || 'Не удалось получить данные');
            resultDiv.innerHTML = `<div class="error-message">Не удалось определить по IP: ${this.escapeHtml(errText)}</div>`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('get-location-btn')) {
        new GeolocationAPI();
    }
});

