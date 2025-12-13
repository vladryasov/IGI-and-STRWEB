/**
 * Класс слайдера для изображений
 */
class ImageSlider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        // Параметры по умолчанию
        this.options = {
            loop: options.loop !== undefined ? options.loop : true,
            navs: options.navs !== undefined ? options.navs : true,
            pags: options.pags !== undefined ? options.pags : true,
            auto: options.auto !== undefined ? options.auto : false,
            stopMouseHover: options.stopMouseHover !== undefined ? options.stopMouseHover : false,
            delay: options.delay || 5, // в секундах
            slides: options.slides || [],
            showSettings: options.showSettings !== undefined ? options.showSettings : false
        };

        this.currentSlide = 0;
        this.autoInterval = null;
        this.isPaused = false;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        // Загружаем настройки из localStorage (только для администратора)
        if (this.options.showSettings) {
            this.loadSettings();
        }

        // Учитываем предпочтение уменьшенной анимации
        if (this.prefersReducedMotion) {
            this.options.auto = false;
        }
        
        // Создаем структуру слайдера
        this.createSliderStructure();
        
        // Загружаем слайды
        this.loadSlides();
        
        // Инициализируем навигацию
        if (this.options.navs) {
            this.createNavigation();
        }
        
        // Инициализируем пагинацию
        if (this.options.pags) {
            this.createPagination();
        }
        
        // Создаем форму для настройки задержки (только если разрешено)
        if (this.options.showSettings) {
            this.createSettingsForm();
        }
        
        // Запускаем автопрокрутку если нужно
        if (this.options.auto) {
            this.startAutoSlide();
        }
        
        // Обработчики событий
        this.attachEventListeners();
        
        // Показываем первый слайд без анимации при загрузке
        const firstSlide = this.slidesContainer.querySelector('.slider-slide');
        if (firstSlide) {
            firstSlide.classList.add('active');
            firstSlide.style.transform = 'translateX(0)';
            firstSlide.style.opacity = '1';
        }
        this.updateCounter(1, this.options.slides.length);
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('sliderSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.delay !== undefined) this.options.delay = settings.delay;
                if (settings.auto !== undefined) this.options.auto = settings.auto;
                if (settings.loop !== undefined) this.options.loop = settings.loop;
            } catch (e) {
                console.error('Ошибка загрузки настроек слайдера:', e);
            }
        }
    }

    saveSettings() {
        if (this.options.showSettings) {
            const settings = {
                delay: this.options.delay,
                auto: this.options.auto,
                loop: this.options.loop
            };
            localStorage.setItem('sliderSettings', JSON.stringify(settings));
        }
    }

    createSliderStructure() {
        this.container.innerHTML = `
            <div class="slider-wrapper">
                <div class="slider-slides"></div>
                <div class="slider-controls"></div>
                <div class="slider-pagination"></div>
                <div class="slider-info">
                    <span class="slider-counter">1/1</span>
                    <div class="slider-caption"></div>
                </div>
                ${this.options.showSettings ? `
                <div class="slider-settings">
                    <h4>Настройки слайдера</h4>
                    <label>
                        Задержка (секунды):
                        <input type="number" id="slider-delay-input" min="1" value="${this.options.delay}">
                    </label>
                    <label>
                        <input type="checkbox" id="slider-auto-checkbox" ${this.options.auto ? 'checked' : ''}>
                        Автопрокрутка
                    </label>
                    <label>
                        <input type="checkbox" id="slider-loop-checkbox" ${this.options.loop ? 'checked' : ''}>
                        Бесконечная прокрутка
                    </label>
                    <button id="slider-apply-delay">Применить</button>
                </div>
                ` : ''}
            </div>
        `;
        
        this.slidesContainer = this.container.querySelector('.slider-slides');
        this.controlsContainer = this.container.querySelector('.slider-controls');
        this.paginationContainer = this.container.querySelector('.slider-pagination');
        this.counterElement = this.container.querySelector('.slider-counter');
        this.captionElement = this.container.querySelector('.slider-caption');
    }

    loadSlides() {
        if (this.options.slides.length === 0) {
            console.warn('No slides provided');
            return;
        }

        this.slidesContainer.innerHTML = '';
        this.options.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'slider-slide';
            slideElement.dataset.index = index;
            
            const link = document.createElement('a');
            link.href = slide.url || '#';
            link.style.display = 'block';
            link.style.width = '100%';
            link.style.height = '100%';
            
            const img = document.createElement('img');
            img.src = slide.image;
            img.alt = slide.caption || `Slide ${index + 1}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.loading = 'lazy';
            
            link.appendChild(img);
            slideElement.appendChild(link);
            
            if (slide.caption) {
                const caption = document.createElement('div');
                caption.className = 'slide-caption-text';
                caption.textContent = slide.caption;
                slideElement.appendChild(caption);
            }
            
            this.slidesContainer.appendChild(slideElement);
        });
    }

    createNavigation() {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-btn slider-btn-prev';
        prevBtn.innerHTML = '&#8249;';
        prevBtn.setAttribute('aria-label', 'Предыдущий слайд');
        prevBtn.addEventListener('click', () => this.prevSlide());

        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-btn slider-btn-next';
        nextBtn.innerHTML = '&#8250;';
        nextBtn.setAttribute('aria-label', 'Следующий слайд');
        nextBtn.addEventListener('click', () => this.nextSlide());

        this.controlsContainer.appendChild(prevBtn);
        this.controlsContainer.appendChild(nextBtn);
    }

    createPagination() {
        this.paginationContainer.innerHTML = '';
        this.options.slides.forEach((_, index) => {
            const pagBtn = document.createElement('button');
            pagBtn.className = 'slider-pag-btn';
            pagBtn.dataset.index = index;
            pagBtn.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
            pagBtn.addEventListener('click', () => this.goToSlide(index));
            this.paginationContainer.appendChild(pagBtn);
        });
    }

    createSettingsForm() {
        const delayInput = this.container.querySelector('#slider-delay-input');
        const autoCheckbox = this.container.querySelector('#slider-auto-checkbox');
        const loopCheckbox = this.container.querySelector('#slider-loop-checkbox');
        const applyBtn = this.container.querySelector('#slider-apply-delay');
        
        // Устанавливаем текущие значения
        if (delayInput) delayInput.value = this.options.delay;
        if (autoCheckbox) autoCheckbox.checked = this.options.auto;
        if (loopCheckbox) loopCheckbox.checked = this.options.loop;
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const newDelay = parseInt(delayInput.value);
                const newAuto = autoCheckbox ? autoCheckbox.checked : this.options.auto;
                const newLoop = loopCheckbox ? loopCheckbox.checked : this.options.loop;
                
                if (newDelay > 0) {
                    this.options.delay = newDelay;
                    this.options.auto = newAuto;
                    this.options.loop = newLoop;
                    
                    // Сохраняем настройки
                    this.saveSettings();
                    
                    // Обновляем автопрокрутку
                    this.stopAutoSlide();
                    if (this.options.auto) {
                        this.startAutoSlide();
                    }
                }
            });
        }
    }

    showSlide(index) {
        const slides = this.slidesContainer.querySelectorAll('.slider-slide');
        const pagButtons = this.paginationContainer.querySelectorAll('.slider-pag-btn');
        
        if (slides.length === 0) return;

        // Нормализуем индекс для зацикливания
        if (index < 0) {
            index = this.options.slides.length - 1;
        } else if (index >= this.options.slides.length) {
            index = 0;
        }

        // Если это первый показ (currentSlide еще не установлен), показываем без анимации
        if (this.currentSlide === undefined || this.currentSlide === null) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev');
                if (i === index) {
                    slide.classList.add('active');
                    slide.style.transform = 'translateX(0)';
                    slide.style.opacity = '1';
                } else {
                    slide.style.transform = 'translateX(100%)';
                    slide.style.opacity = '0';
                }
                if (pagButtons[i]) {
                    pagButtons[i].classList.toggle('active', i === index);
                }
            });
            this.currentSlide = index;
            this.updateCounter(index + 1, slides.length);
            return;
        }

        const prevIndex = this.currentSlide;
        
        // Если тот же слайд, ничего не делаем
        if (prevIndex === index) return;

        // Определяем направление с учетом зацикливания
        let direction = 1;
        if (this.options.loop) {
            // При зацикливании определяем кратчайший путь
            const forward = (index > prevIndex) ? (index - prevIndex) : (this.options.slides.length - prevIndex + index);
            const backward = (prevIndex > index) ? (prevIndex - index) : (prevIndex + this.options.slides.length - index);
            direction = forward <= backward ? 1 : -1;
        } else {
            direction = index > prevIndex ? 1 : -1;
        }

        // Для пользователей с prefers-reduced-motion — переключаем без анимации
        if (this.prefersReducedMotion) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
                slide.classList.remove('prev');
                slide.style.transform = i === index ? 'translateX(0)' : 'translateX(100%)';
                slide.style.opacity = i === index ? '1' : '0';
                if (pagButtons[i]) {
                    pagButtons[i].classList.toggle('active', i === index);
                }
            });
            this.updateCounter(index + 1, slides.length);
            this.captionElement.textContent = '';
            this.currentSlide = index;
            return;
        }

        // Удаляем все классы
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev');
            if (pagButtons[i]) {
                pagButtons[i].classList.remove('active');
            }
        });

        // Устанавливаем предыдущий слайд для анимации выхода
        if (slides[prevIndex]) {
            slides[prevIndex].classList.add('prev');
            slides[prevIndex].style.transform = direction > 0 ? 'translateX(-100%)' : 'translateX(100%)';
            slides[prevIndex].style.opacity = '0';
        }

        // Показываем текущий слайд с анимацией входа
        if (slides[index]) {
            // Устанавливаем начальную позицию для анимации
            slides[index].style.transform = direction > 0 ? 'translateX(100%)' : 'translateX(-100%)';
            slides[index].style.opacity = '0';
            
            // Небольшая задержка для плавной анимации
            requestAnimationFrame(() => {
                slides[index].classList.add('active');
                slides[index].style.transform = 'translateX(0)';
                slides[index].style.opacity = '1';
            });
            
            if (pagButtons[index]) {
                pagButtons[index].classList.add('active');
            }
        }

        // Обновляем счетчик
        this.updateCounter(index + 1, slides.length);
        
        // Обновляем подпись (она уже в самом слайде, так что не нужно обновлять captionElement)
        this.captionElement.textContent = '';

        this.currentSlide = index;
    }

    updateCounter(current, total) {
        this.counterElement.textContent = `${current}/${total}`;
    }

    nextSlide() {
        let nextIndex = this.currentSlide + 1;
        
        if (nextIndex >= this.options.slides.length) {
            if (this.options.loop) {
                nextIndex = 0;
            } else {
                nextIndex = this.currentSlide;
            }
        }
        
        this.showSlide(nextIndex);
    }

    prevSlide() {
        let prevIndex = this.currentSlide - 1;
        
        if (prevIndex < 0) {
            if (this.options.loop) {
                prevIndex = this.options.slides.length - 1;
            } else {
                prevIndex = this.currentSlide;
            }
        }
        
        this.showSlide(prevIndex);
    }

    goToSlide(index) {
        if (index >= 0 && index < this.options.slides.length) {
            this.showSlide(index);
        }
    }

    startAutoSlide() {
        if (this.autoInterval) {
            this.stopAutoSlide();
        }
        
        this.autoInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.options.delay * 1000);
    }

    stopAutoSlide() {
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }

    attachEventListeners() {
        // Обработка наведения мыши для stopMouseHover
        if (this.options.auto && this.options.stopMouseHover) {
            this.container.addEventListener('mouseenter', () => {
                this.isPaused = true;
            });
            
            this.container.addEventListener('mouseleave', () => {
                this.isPaused = false;
            });
        }
    }
}

