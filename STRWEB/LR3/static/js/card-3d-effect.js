/**
 * 3D эффект для карточек товаров
 * Добавляет интерактивный 3D эффект при наведении мыши
 */

class Card3DEffect {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!this.prefersReducedMotion) {
            this.init();
        }
    }

    init() {
        const cards = document.querySelectorAll('.pizza-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
            card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, card));
        });
    }

    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
    }

    handleMouseLeave(e, card) {
        card.style.transform = '';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.pizza-card')) {
        new Card3DEffect();
    }
});

