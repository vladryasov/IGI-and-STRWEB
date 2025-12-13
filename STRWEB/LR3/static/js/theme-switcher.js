/**
 * Переключатель темы (темная/светлая)
 */
class ThemeSwitcher {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Применяем сохраненную тему
        this.applyTheme(this.theme);
        
        // Создаем переключатель если его нет
        this.createSwitcher();
        
        // Обработчик изменения темы
        this.attachEventListeners();
    }

    createSwitcher() {
        // Проверяем, есть ли уже переключатель
        if (document.getElementById('theme-switcher')) {
            return;
        }

        const switcher = document.createElement('div');
        switcher.id = 'theme-switcher';
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <label class="theme-switch">
                <input type="checkbox" id="theme-toggle" ${this.theme === 'dark' ? 'checked' : ''}>
                <span class="slider-round"></span>
                <span class="theme-label">${this.theme === 'dark' ? '🌙' : '☀️'}</span>
            </label>
        `;
        
        // Добавляем в body или в header
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(switcher);
        } else {
            document.body.insertBefore(switcher, document.body.firstChild);
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.theme = theme;
        
        // Обновляем иконку переключателя
        const toggle = document.getElementById('theme-toggle');
        const label = document.querySelector('.theme-label');
        if (toggle) {
            toggle.checked = theme === 'dark';
        }
        if (label) {
            label.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    attachEventListeners() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('change', () => {
                this.toggleTheme();
            });
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
});


