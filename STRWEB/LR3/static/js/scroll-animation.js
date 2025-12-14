/**
 * Анимация “пицца из 8 долек” при скролле:
 * - в начале секции пицца собрана
 * - по мере прокрутки внутри секции дольки разъезжаются радиально
 * - при прокрутке вверх (уменьшении progress) дольки собираются обратно
 */

class PizzaSplitScrollAnimation {
    constructor() {
        this.container = document.getElementById('scroll-animation-container');
        this.pizza = document.getElementById('pizza-split-pizza');
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!this.container || !this.pizza) return;

        this.slices = Array.from(this.pizza.querySelectorAll('.pizza-slice'));
        this.ticking = false;

        this.onScroll = this.onScroll.bind(this);
        this.onResize = this.onResize.bind(this);
        this.update = this.update.bind(this);

        this.init();
    }

    init() {
        // Reduced motion: оставляем собранную пиццу без движения
        if (this.prefersReducedMotion) {
            this.setSliceOffsets(0);
            return;
        }

        // Скроллим именно контейнер секции, чтобы анимация не “улетала” со страницы
        this.container.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onResize, { passive: true });

        // Первичная отрисовка
        this.update();
    }

    onScroll() {
        this.requestTick();
    }

    onResize() {
        this.requestTick();
    }

    requestTick() {
        if (this.ticking) return;
        this.ticking = true;
        window.requestAnimationFrame(this.update);
    }

    clamp01(value) {
        return Math.min(1, Math.max(0, value));
    }

    smoothstep(t) {
        // 0..1 -> 0..1 (плавнее в начале/конце)
        return t * t * (3 - 2 * t);
    }

    getProgress() {
        const maxScroll = (this.container.scrollHeight - this.container.clientHeight);
        if (maxScroll <= 1) return 0;
        return this.clamp01(this.container.scrollTop / maxScroll);
    }

    setSliceOffsets(distancePx) {
        const step = 360 / Math.max(1, this.slices.length);
        const centerOffset = step / 2;

        for (let i = 0; i < this.slices.length; i++) {
            // 0-я долька — сверху (12 часов)
            const angleDeg = (i * step) - 90 + centerOffset;
            const angle = (angleDeg * Math.PI) / 180;

            const dx = Math.cos(angle) * distancePx;
            const dy = Math.sin(angle) * distancePx;

            this.slices[i].style.setProperty('--tx', `${dx.toFixed(2)}px`);
            this.slices[i].style.setProperty('--ty', `${dy.toFixed(2)}px`);
        }
    }

    update() {
        this.ticking = false;

        const rawProgress = this.getProgress();
        const progress = this.smoothstep(rawProgress);

        const pizzaRect = this.pizza.getBoundingClientRect();
        const size = pizzaRect.width || pizzaRect.height || 0;
        const maxDistance = Math.max(0, Math.min(220, size * 0.28));

        this.setSliceOffsets(progress * maxDistance);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('scroll-animation-container')) {
        new PizzaSplitScrollAnimation();
    }
});

