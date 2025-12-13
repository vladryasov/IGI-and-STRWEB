/**
 * Улучшенная анимация при скроллинге - движущиеся пиццы (Вариант 19)
 * С использованием Intersection Observer API
 */

class EnhancedScrollAnimation {
    constructor() {
        this.pizzas = [];
        this.observer = null;
        this.animationEnabled = true;
        this.pizzaCount = 8;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        if (this.prefersReducedMotion) {
            this.animationEnabled = false;
        }
        this.loadSettings();
        this.createPizzaElements();
        this.setupIntersectionObserver();
        this.attachScrollListener();
        this.createControls();
    }

    loadSettings() {
        const saved = localStorage.getItem('scrollAnimationSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.animationEnabled = settings.enabled !== false;
                this.pizzaCount = settings.pizzaCount || 8;
            } catch (e) {
                console.error('Ошибка загрузки настроек:', e);
            }
        }
    }

    saveSettings() {
        const settings = {
            enabled: this.animationEnabled,
            pizzaCount: this.pizzaCount
        };
        localStorage.setItem('scrollAnimationSettings', JSON.stringify(settings));
    }

    createPizzaElements() {
        const container = document.getElementById('scroll-animation-container');
        if (!container) return;

        // Очищаем существующие пиццы
        container.innerHTML = '';

        // Массив изображений пицц (можно использовать эмодзи или реальные изображения)
        const pizzaTypes = ['🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕', '🍕'];
        
        // Создаем пиццы с разными траекториями
        for (let i = 0; i < this.pizzaCount; i++) {
            const pizza = document.createElement('div');
            pizza.className = 'animated-pizza';
            pizza.dataset.index = i;
            pizza.dataset.type = pizzaTypes[i % pizzaTypes.length];
            pizza.dataset.speed = (0.5 + Math.random() * 1.5).toFixed(2);
            pizza.dataset.trajectory = ['sinusoidal', 'circular', 'linear', 'zigzag'][i % 4];
            
            // Случайная начальная позиция
            pizza.style.left = `${Math.random() * 90 + 5}%`;
            pizza.style.top = `${Math.random() * 90 + 5}%`;
            pizza.style.animationDelay = `${Math.random() * 2}s`;
            pizza.style.fontSize = `${3 + Math.random() * 2}rem`;
            
            pizza.innerHTML = pizza.dataset.type;
            pizza.setAttribute('aria-label', `Анимированная пицца ${i + 1}`);
            
            container.appendChild(pizza);
            this.pizzas.push(pizza);
        }

        if (this.prefersReducedMotion) {
            this.applyReducedMotion();
        }
    }

    setupIntersectionObserver() {
        const container = document.getElementById('scroll-animation-container');
        if (!container) return;
        if (this.prefersReducedMotion) return;

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.5, 1.0]
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const intensity = entry.intersectionRatio;
                this.pizzas.forEach((pizza, index) => {
                    if (intensity > 0) {
                        pizza.style.opacity = intensity;
                        pizza.style.animationPlayState = 'running';
                    } else {
                        pizza.style.animationPlayState = 'paused';
                    }
                });
            });
        }, options);

        this.observer.observe(container);
    }

    attachScrollListener() {
        let lastScrollTop = 0;
        let ticking = false;

        const handleScroll = () => {
            if (!ticking && this.animationEnabled) {
                window.requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
                    const scrollSpeed = Math.abs(scrollTop - lastScrollTop);
                    lastScrollTop = scrollTop;

                    this.pizzas.forEach((pizza, index) => {
                        const rect = pizza.getBoundingClientRect();
                        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                        if (isVisible) {
                            const speed = parseFloat(pizza.dataset.speed);
                            const trajectory = pizza.dataset.trajectory;
                            
                            let transform = this.calculateTransform(
                                scrollTop,
                                scrollDirection,
                                scrollSpeed,
                                speed,
                                trajectory,
                                index
                            );
                            
                            pizza.style.transform = transform;
                        }
                    });

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    calculateTransform(scrollTop, direction, speed, pizzaSpeed, trajectory, index) {
        const baseOffset = scrollTop * 0.1 * pizzaSpeed;
        const rotation = scrollTop * 0.2 * pizzaSpeed;
        const scale = 1 + (scrollTop * 0.0001 * pizzaSpeed);

        let x = 0;
        let y = 0;

        switch(trajectory) {
            case 'sinusoidal':
                // Синусоидальная траектория
                x = Math.sin(scrollTop * 0.01 + index) * 50;
                y = baseOffset + Math.cos(scrollTop * 0.01 + index) * 30;
                break;
            case 'circular':
                // Круговая траектория
                x = Math.cos(scrollTop * 0.02 + index) * 40;
                y = baseOffset + Math.sin(scrollTop * 0.02 + index) * 40;
                break;
            case 'linear':
                // Линейная траектория
                x = scrollTop * 0.05 * (index % 2 === 0 ? 1 : -1);
                y = baseOffset;
                break;
            case 'zigzag':
                // Зигзагообразная траектория
                x = Math.sin(scrollTop * 0.03 + index) * 60;
                y = baseOffset;
                break;
            default:
                y = baseOffset;
        }

        if (direction === 'up') {
            y = -y;
            x = -x;
        }

        return `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
    }

    createControls() {
        const container = document.getElementById('scroll-animation-container');
        if (!container) return;

        const controlsHTML = `
            <div class="animation-controls">
                <label>
                    <input type="checkbox" id="animation-toggle" ${this.animationEnabled ? 'checked' : ''}>
                    Включить анимацию
                </label>
                <label>
                    Количество пицц:
                    <input type="range" id="pizza-count-slider" min="3" max="15" value="${this.pizzaCount}">
                    <span id="pizza-count-display">${this.pizzaCount}</span>
                </label>
                <button id="reset-animation-btn" class="btn-small">Сбросить</button>
            </div>
        `;

        container.insertAdjacentHTML('beforebegin', controlsHTML);

        const toggle = document.getElementById('animation-toggle');
        const slider = document.getElementById('pizza-count-slider');
        const display = document.getElementById('pizza-count-display');
        const resetBtn = document.getElementById('reset-animation-btn');

        if (toggle) {
            toggle.addEventListener('change', (e) => {
                this.animationEnabled = e.target.checked;
                this.saveSettings();
            });
        }

        if (slider && display) {
            slider.addEventListener('input', (e) => {
                this.pizzaCount = parseInt(e.target.value);
                display.textContent = this.pizzaCount;
                this.createPizzaElements();
                this.setupIntersectionObserver();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.createPizzaElements();
                this.setupIntersectionObserver();
            });
        }
    }

    applyReducedMotion() {
        this.pizzas.forEach(pizza => {
            pizza.style.animation = 'none';
            pizza.style.transition = 'none';
            pizza.style.transform = 'none';
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('scroll-animation-container')) {
        new EnhancedScrollAnimation();
    }
});

