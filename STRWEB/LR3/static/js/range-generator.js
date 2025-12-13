/**
 * Генератор элементов input type="range" (Вариант 19)
 * Генерирует слайдеры с возможностью настройки атрибутов
 */

class RangeGenerator {
    constructor() {
        this.ranges = [];
        this.init();
        this.loadFromStorage();
    }

    init() {
        const checkbox = document.getElementById('generate-range-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.showGenerator();
                } else {
                    this.hideGenerator();
                }
            });
        }
    }

    showGenerator() {
        const container = document.getElementById('range-generator-container');
        if (!container) return;

        container.innerHTML = `
            <div class="range-generator-panel">
                <h3>Генератор слайдеров (input type="range")</h3>
                <div class="range-controls">
                    <button id="add-range-btn" class="btn">Добавить слайдер</button>
                    <button id="clear-all-btn" class="btn btn-secondary">Очистить все</button>
                </div>
                <div id="ranges-list" class="ranges-list"></div>
            </div>
        `;

        document.getElementById('add-range-btn').addEventListener('click', () => this.addRange());
        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAll());
        
        this.renderRanges();
    }

    hideGenerator() {
        const container = document.getElementById('range-generator-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    addRange() {
        const rangeId = `range-${Date.now()}`;
        const range = {
            id: rangeId,
            name: `slider-${this.ranges.length + 1}`,
            min: 0,
            max: 100,
            step: 1,
            value: 50,
            list: '',
            disabled: false
        };
        
        this.ranges.push(range);
        this.saveToStorage();
        this.renderRanges();
    }

    removeRange(id) {
        this.ranges = this.ranges.filter(r => r.id !== id);
        this.saveToStorage();
        this.renderRanges();
    }

    clearAll() {
        if (confirm('Удалить все слайдеры?')) {
            this.ranges = [];
            this.saveToStorage();
            this.renderRanges();
        }
    }

    renderRanges() {
        const container = document.getElementById('ranges-list');
        if (!container) return;

        if (this.ranges.length === 0) {
            container.innerHTML = '<p class="no-ranges">Нет созданных слайдеров. Нажмите "Добавить слайдер" для создания.</p>';
            return;
        }

        container.innerHTML = this.ranges.map((range, index) => `
            <div class="range-item" data-id="${range.id}">
                <div class="range-item-header">
                    <h4>Слайдер ${index + 1}</h4>
                    <button class="btn-remove" data-id="${range.id}" aria-label="Удалить слайдер">×</button>
                </div>
                <div class="range-item-content">
                    <div class="range-settings">
                        <div class="setting-group">
                            <label>
                                name:
                                <input type="text" class="range-name" value="${this.escapeHtml(range.name)}" data-id="${range.id}">
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                min:
                                <input type="number" class="range-min" value="${range.min}" data-id="${range.id}">
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                max:
                                <input type="number" class="range-max" value="${range.max}" data-id="${range.id}">
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                step:
                                <input type="number" class="range-step" value="${range.step}" min="0.1" step="0.1" data-id="${range.id}">
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                value:
                                <input type="number" class="range-value" value="${range.value}" data-id="${range.id}">
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                list (datalist id):
                                <input type="text" class="range-list" value="${this.escapeHtml(range.list)}" data-id="${range.id}" placeholder="Опционально">
                            </label>
                        </div>
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" class="range-disabled" ${range.disabled ? 'checked' : ''} data-id="${range.id}">
                                disabled
                            </label>
                        </div>
                    </div>
                    <div class="range-preview">
                        <label>Предпросмотр:</label>
                        <input type="range" 
                               id="${range.id}"
                               name="${this.escapeHtml(range.name)}"
                               min="${range.min}"
                               max="${range.max}"
                               step="${range.step}"
                               value="${range.value}"
                               ${range.list ? `list="${this.escapeHtml(range.list)}"` : ''}
                               ${range.disabled ? 'disabled' : ''}
                               class="range-preview-input">
                        <div class="range-value-display">
                            <span class="value-label">Текущее значение:</span>
                            <span class="value-number" id="value-${range.id}">${range.value}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Привязываем обработчики событий
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Удаление слайдера
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.removeRange(id);
            });
        });

        // Обновление атрибутов
        document.querySelectorAll('.range-name, .range-min, .range-max, .range-step, .range-value, .range-list').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.dataset.id;
                this.updateRange(id, e.target.className.replace('range-', ''), e.target.value);
            });
        });

        // Обновление disabled
        document.querySelectorAll('.range-disabled').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                this.updateRange(id, 'disabled', e.target.checked);
            });
        });

        // Отображение текущего значения слайдера
        document.querySelectorAll('.range-preview-input').forEach(range => {
            range.addEventListener('input', (e) => {
                const valueDisplay = document.getElementById(`value-${e.target.id}`);
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
            });
        });
    }

    updateRange(id, attribute, value) {
        const range = this.ranges.find(r => r.id === id);
        if (!range) return;

        switch(attribute) {
            case 'name':
                range.name = value;
                break;
            case 'min':
                range.min = parseFloat(value) || 0;
                break;
            case 'max':
                range.max = parseFloat(value) || 100;
                break;
            case 'step':
                range.step = parseFloat(value) || 1;
                break;
            case 'value':
                range.value = parseFloat(value) || 0;
                break;
            case 'list':
                range.list = value;
                break;
            case 'disabled':
                range.disabled = value;
                break;
        }

        // Обновляем предпросмотр
        const preview = document.getElementById(id);
        if (preview) {
            preview.name = range.name;
            preview.min = range.min;
            preview.max = range.max;
            preview.step = range.step;
            preview.value = range.value;
            if (range.list) {
                preview.setAttribute('list', range.list);
            } else {
                preview.removeAttribute('list');
            }
            if (range.disabled) {
                preview.disabled = true;
            } else {
                preview.disabled = false;
            }
        }

        this.saveToStorage();
    }

    saveToStorage() {
        localStorage.setItem('generatedRanges', JSON.stringify(this.ranges));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('generatedRanges');
        if (saved) {
            try {
                this.ranges = JSON.parse(saved);
                // Восстанавливаем слайдеры если генератор уже открыт
                if (document.getElementById('generate-range-checkbox')?.checked) {
                    this.showGenerator();
                }
            } catch (e) {
                console.error('Ошибка загрузки слайдеров:', e);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new RangeGenerator();
});

