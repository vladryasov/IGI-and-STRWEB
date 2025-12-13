/**
 * Клиентская пагинация каталога товаров
 * С выбором количества элементов на страницу (3, 6, 9, 12)
 */

class CatalogPagination {
    constructor() {
        this.itemsPerPage = parseInt(localStorage.getItem('catalogItemsPerPage')) || 3;
        this.currentPage = 1;
        this.allItems = [];
        this.init();
    }

    init() {
        // Загружаем сохраненное значение
        this.loadSettings();
        
        // Находим контейнер с товарами
        const itemsContainer = document.querySelector('.pizzas-grid');
        if (!itemsContainer) return;

        // Сохраняем все элементы
        this.allItems = Array.from(itemsContainer.children);
        
        // Создаем панель управления пагинацией
        this.createPaginationControls();
        
        // Применяем пагинацию
        this.applyPagination();
    }

    createPaginationControls() {
        const pizzasSection = document.querySelector('.pizzas-section');
        if (!pizzasSection) return;

        // Проверяем, не созданы ли уже элементы управления
        if (document.getElementById('catalog-pagination-controls')) return;

        const controlsHTML = `
            <div id="catalog-pagination-controls" class="catalog-pagination-controls">
                <div class="items-per-page-selector">
                    <label for="items-per-page-select">Элементов на страницу:</label>
                    <select id="items-per-page-select">
                        <option value="3" ${this.itemsPerPage === 3 ? 'selected' : ''}>3</option>
                        <option value="6" ${this.itemsPerPage === 6 ? 'selected' : ''}>6</option>
                        <option value="9" ${this.itemsPerPage === 9 ? 'selected' : ''}>9</option>
                        <option value="12" ${this.itemsPerPage === 12 ? 'selected' : ''}>12</option>
                    </select>
                </div>
                <div id="catalog-pagination" class="catalog-pagination"></div>
            </div>
        `;

        const pizzasGrid = document.querySelector('.pizzas-grid');
        if (pizzasGrid && pizzasGrid.parentNode) {
            pizzasGrid.parentNode.insertAdjacentHTML('beforeend', controlsHTML);
        }

        // Привязываем обработчики
        const select = document.getElementById('items-per-page-select');
        if (select) {
            select.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.saveSettings();
                this.applyPagination();
            });
        }
    }

    applyPagination() {
        const itemsContainer = document.querySelector('.pizzas-grid');
        if (!itemsContainer) return;

        const totalPages = Math.ceil(this.allItems.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;

        // Скрываем все элементы
        this.allItems.forEach((item, index) => {
            if (index >= startIndex && index < endIndex) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

        // Обновляем пагинацию
        this.renderPagination(totalPages);
    }

    renderPagination(totalPages) {
        const paginationContainer = document.getElementById('catalog-pagination');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-buttons">';
        
        // Кнопка "Предыдущая"
        paginationHTML += `<button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">Предыдущая</button>`;
        
        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Кнопка "Следующая"
        paginationHTML += `<button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">Следующая</button>`;
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;

        // Привязываем обработчики
        paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!e.target.disabled) {
                    this.currentPage = parseInt(e.target.dataset.page);
                    this.applyPagination();
                    // Прокрутка к началу списка
                    document.querySelector('.pizzas-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    loadSettings() {
        const saved = localStorage.getItem('catalogItemsPerPage');
        if (saved) {
            this.itemsPerPage = parseInt(saved) || 3;
        }
    }

    saveSettings() {
        localStorage.setItem('catalogItemsPerPage', this.itemsPerPage.toString());
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем только на странице каталога
    if (document.querySelector('.pizzas-grid')) {
        new CatalogPagination();
    }
});

