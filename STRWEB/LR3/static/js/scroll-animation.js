/**
 * Анимация при скроллинге - движущиеся пиццы
 */

class ScrollAnimation {
    constructor() {
        this.pizzas = [];
        this.init();
    }

    init() {
        this.createPizzaElements();
        this.attachScrollListener();
        this.attachResizeListener();
    }

    createPizzaElements() {
        const container = document.getElementById('scroll-animation-container');
        if (!container) return;

        // Создаем несколько пицц для анимации
        for (let i = 0; i < 8; i++) {
            const pizza = document.createElement('div');
            pizza.className = 'animated-pizza';
            pizza.style.left = `${Math.random() * 100}%`;
            pizza.style.top = `${Math.random() * 100}%`;
            pizza.style.animationDelay = `${Math.random() * 2}s`;
            // Делаем пиццы всегда яркими
            pizza.style.opacity = '1';
            pizza.innerHTML = '🍕';
            container.appendChild(pizza);
            this.pizzas.push(pizza);
        }
    }

    attachScrollListener() {
        let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const delta = scrollTop - lastScrollTop;
            lastScrollTop = scrollTop;

            this.pizzas.forEach((pizza, index) => {
                // Храним накопленный сдвиг для каждого кусочка
                if (typeof pizza._offsetY !== 'number') {
                    pizza._offsetY = 0;
                }

                // Движение в сторону скролла: вниз при прокрутке вниз, вверх при прокрутке вверх
                pizza._offsetY += delta * 0.35;

                // Легкое вращение для живости, но без масштабирования/выцветания
                const rotation = pizza._offsetY * 0.05;
                pizza.style.transform = `translateY(${pizza._offsetY}px) rotate(${rotation}deg)`;
                pizza.style.opacity = '1';
            });
        });
    }

    attachResizeListener() {
        window.addEventListener('resize', () => {
            // Пересчитываем позиции при изменении размера окна
            this.pizzas.forEach(pizza => {
                const randomX = Math.random() * 100;
                const randomY = Math.random() * 100;
                pizza.style.left = `${randomX}%`;
                pizza.style.top = `${randomY}%`;
            });
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimation();
});


