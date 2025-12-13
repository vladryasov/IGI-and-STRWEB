class EmployeesTable {
    constructor() {
        this.employees = [];
        this.filteredEmployees = [];
        this.currentPage = 1;
        this.itemsPerPage = 3;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.selectedEmployees = new Set();

        this.tbody = document.getElementById('employees-tbody');
        this.paginationContainer = document.getElementById('pagination-container');
        this.filterInput = document.getElementById('filter-input');
        this.filterBtn = document.getElementById('filter-btn');
        this.addBtn = document.getElementById('add-employee-btn');
        this.formSection = document.getElementById('add-employee-form');
        this.form = document.getElementById('employee-form');
        this.premiateBtn = document.getElementById('premiate-btn');
        this.selectAllCheckbox = document.getElementById('select-all');
        this.detailsBlock = document.getElementById('employee-details');
        this.premiateResult = document.getElementById('premiate-result');
        this.preloader = document.querySelector('.preloader');

        this.bindStaticEvents();
        this.init();
    }

    async init() {
        await this.loadEmployees();
        this.render();
    }

    bindStaticEvents() {
        // Сортировка по заголовкам
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => this.applyWithLoader(() => this.sort(th.dataset.column)));
        });

        // Фильтрация
        if (this.filterBtn) {
            this.filterBtn.addEventListener('click', () => this.applyWithLoader(() => this.filter()));
        }
        if (this.filterInput) {
            this.filterInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyWithLoader(() => this.filter());
                }
            });
        }

        // Пагинация (делегирование)
        if (this.paginationContainer) {
            this.paginationContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.pagination-btn');
                if (btn && !btn.disabled) {
                    const page = parseInt(btn.dataset.page, 10);
                    if (!Number.isNaN(page)) {
                        this.applyWithLoader(() => {
                            this.currentPage = page;
                            this.render();
                        });
                    }
                }
            });
        }

        // Выбор всех на странице
        if (this.selectAllCheckbox) {
            this.selectAllCheckbox.addEventListener('change', (e) => {
                const checked = e.target.checked;
                this.getCurrentPageEmployees().forEach(emp => {
                    if (checked) {
                        this.selectedEmployees.add(emp.id);
                    } else {
                        this.selectedEmployees.delete(emp.id);
                    }
                });
                this.renderRows();
                this.updatePremiateButton();
            });
        }

        // Клики/изменения внутри tbody
        if (this.tbody) {
            this.tbody.addEventListener('change', (e) => {
                if (e.target.classList.contains('employee-checkbox')) {
                    const id = parseInt(e.target.dataset.id, 10);
                    if (e.target.checked) {
                        this.selectedEmployees.add(id);
                    } else {
                        this.selectedEmployees.delete(id);
                    }
                    this.syncSelectAllState();
                    this.updatePremiateButton();
                }
            });

            this.tbody.addEventListener('click', (e) => {
                const row = e.target.closest('tr[data-id]');
                if (row && !e.target.closest('input[type="checkbox"]')) {
                    const id = parseInt(row.dataset.id, 10);
                    this.showEmployeeDetails(id);
                    this.highlightRow(row);
                }
            });
        }

        // Добавление/скрытие формы
        if (this.addBtn) {
            this.addBtn.addEventListener('click', () => this.toggleAddForm());
        }

        // Работа с формой
        if (this.form) {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.applyWithLoader(() => this.addEmployee());
            });

            this.form.addEventListener('input', () => this.checkFormValidity());
        }

        const cancelBtn = document.getElementById('cancel-form-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.toggleAddForm(false);
                this.resetForm();
            });
        }

        const photoInput = document.getElementById('form-photo');
        if (photoInput) {
            photoInput.addEventListener('blur', () => this.validateURL(photoInput.value));
        }
        const phoneInput = document.getElementById('form-phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.validatePhone(phoneInput.value));
        }

        // Премирование
        if (this.premiateBtn) {
            this.premiateBtn.addEventListener('click', () => this.premiateEmployees());
        }
    }

    async loadEmployees() {
        try {
            this.showPreloader();
            const response = await fetch('/api/employees/');
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            const data = await response.json();
            this.employees = this.ensureMinimumRecords(data || []);
            this.filteredEmployees = [...this.employees];
        } catch (error) {
            console.error('Ошибка загрузки сотрудников:', error);
            this.employees = this.ensureMinimumRecords([]);
            this.filteredEmployees = [...this.employees];
        } finally {
            this.hidePreloader();
        }
    }

    ensureMinimumRecords(data) {
        const base = (data && data.length ? data : this.sampleEmployees()).map(emp => this.normalizeEmployee(emp));
        const result = [...base];
        let idx = 0;
        while (result.length < 10 && base.length) {
            const clone = { ...base[idx % base.length], id: Date.now() + idx };
            result.push(clone);
            idx += 1;
        }
        return result;
    }

    sampleEmployees() {
        const placeholders = [];
        for (let i = 1; i <= 10; i++) {
            placeholders.push({
                id: i,
                name: `Сотрудник ${i}`,
                position: 'Специалист',
                photo: `https://via.placeholder.com/120?text=Employee+${i}`,
                phone: '+375 (29) 111-22-33',
                email: `employee${i}@pizzeria.by`,
                description: 'Описание работы сотрудника'
            });
        }
        return placeholders;
    }

    normalizeEmployee(emp) {
        return {
            id: emp.id ?? Date.now(),
            name: emp.name || 'Неизвестный',
            position: emp.position || 'Сотрудник',
            photo: emp.photo || 'https://via.placeholder.com/120?text=Photo',
            phone: emp.phone || '',
            email: emp.email || '',
            description: emp.description || ''
        };
    }

    render() {
        this.renderRows();
        this.renderPagination();
        this.updateSortIcons();
        this.updatePremiateButton();
        this.syncSelectAllState();
    }

    renderRows() {
        if (!this.tbody) return;
        const pageEmployees = this.getCurrentPageEmployees();

        if (!pageEmployees.length) {
            this.tbody.innerHTML = `
                <tr class="placeholder-row">
                    <td colspan="7">Ничего не найдено</td>
                </tr>
            `;
            return;
        }

        const rows = pageEmployees.map(emp => `
            <tr data-id="${emp.id}" class="${this.selectedEmployees.has(emp.id) ? 'selected-row' : ''}">
                <td class="checkbox-cell">
                    <input type="checkbox" class="employee-checkbox" data-id="${emp.id}" ${this.selectedEmployees.has(emp.id) ? 'checked' : ''} aria-label="Выбрать ${this.escapeHtml(emp.name)}">
                </td>
                <td>${this.escapeHtml(emp.name)}</td>
                <td>${this.escapeHtml(emp.position)}</td>
                <td><img src="${emp.photo}" alt="${this.escapeHtml(emp.name)}" width="60" height="60"></td>
                <td>${this.escapeHtml(emp.phone)}</td>
                <td>${this.escapeHtml(emp.email)}</td>
                <td>${this.escapeHtml(emp.description)}</td>
            </tr>
        `).join('');

        this.tbody.innerHTML = rows;
    }

    renderPagination() {
        if (!this.paginationContainer) return;
        const totalPages = Math.max(1, Math.ceil(this.filteredEmployees.length / this.itemsPerPage));
        if (totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        let html = '<div class="pagination">';
        html += `<button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">Предыдущая</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        html += `<button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">Следующая</button>`;
        html += '</div>';
        this.paginationContainer.innerHTML = html;
    }

    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredEmployees.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            }
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        });

        this.currentPage = 1;
        this.render();
    }

    updateSortIcons() {
        document.querySelectorAll('.sort-icon').forEach(icon => {
            const column = icon.dataset.icon;
            if (this.sortColumn === column) {
                icon.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
            } else {
                icon.textContent = '';
            }
        });
    }

    filter() {
        const value = (this.filterInput?.value || '').trim().toLowerCase();
        if (!value) {
            this.filteredEmployees = [...this.employees];
        } else {
            this.filteredEmployees = this.employees.filter(emp =>
                emp.name.toLowerCase().includes(value) ||
                emp.position.toLowerCase().includes(value) ||
                emp.phone.toLowerCase().includes(value) ||
                emp.email.toLowerCase().includes(value) ||
                emp.description.toLowerCase().includes(value)
            );
        }

        // Очищаем выбор для отсутствующих элементов
        const visibleIds = new Set(this.filteredEmployees.map(e => e.id));
        this.selectedEmployees.forEach(id => {
            if (!visibleIds.has(id)) {
                this.selectedEmployees.delete(id);
            }
        });

        this.currentPage = 1;
        this.render();
    }

    validateURL(url) {
        const value = (url || '').trim();
        const pattern = /^https?:\/\/.+(\.php|\.html)$/;
        const isValid = !!value && pattern.test(value);
        const validationDiv = document.getElementById('photo-validation');
        if (validationDiv) {
            validationDiv.textContent = value
                ? (isValid ? 'URL валиден' : 'URL должен начинаться с http:// или https:// и заканчиваться на .php или .html')
                : '';
            validationDiv.className = `validation-message ${isValid ? 'valid' : value ? 'invalid' : ''}`;
        }
        const input = document.getElementById('form-photo');
        if (input) {
            input.classList.toggle('invalid-input', value ? !isValid : false);
        }
        return isValid;
    }

    validatePhone(phone) {
        const value = (phone || '').trim();
        const pattern = /^(?:\+375|8)\s?\(?\d{2,3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2,3}$/;
        const isValid = !!value && pattern.test(value.replace(/\s+/g, ' '));
        const validationDiv = document.getElementById('phone-validation');
        if (validationDiv) {
            validationDiv.textContent = value
                ? (isValid ? 'Телефон валиден' : 'Номер должен начинаться с +375 или 8, код может быть в скобках')
                : '';
            validationDiv.className = `validation-message ${isValid ? 'valid' : value ? 'invalid' : ''}`;
        }
        const input = document.getElementById('form-phone');
        if (input) {
            input.classList.toggle('invalid-input', value ? !isValid : false);
        }
        return isValid;
    }

    checkFormValidity() {
        const name = this.form?.querySelector('#form-name')?.value.trim();
        const position = this.form?.querySelector('#form-position')?.value.trim();
        const photo = this.form?.querySelector('#form-photo')?.value.trim();
        const phone = this.form?.querySelector('#form-phone')?.value.trim();
        const email = this.form?.querySelector('#form-email')?.value.trim();
        const description = this.form?.querySelector('#form-description')?.value.trim();

        const isURLValid = this.validateURL(photo);
        const isPhoneValid = this.validatePhone(phone);
        const allFilled = name && position && photo && phone && email && description;

        const submitBtn = document.getElementById('submit-employee-btn');
        if (submitBtn) {
            submitBtn.disabled = !(allFilled && isURLValid && isPhoneValid);
        }
    }

    addEmployee() {
        const name = this.form?.querySelector('#form-name')?.value.trim();
        const position = this.form?.querySelector('#form-position')?.value.trim();
        const photo = this.form?.querySelector('#form-photo')?.value.trim();
        const phone = this.form?.querySelector('#form-phone')?.value.trim();
        const email = this.form?.querySelector('#form-email')?.value.trim();
        const description = this.form?.querySelector('#form-description')?.value.trim();

        if (!name || !position || !photo || !phone || !email || !description) return;
        if (!this.validateURL(photo) || !this.validatePhone(phone)) return;

        const employee = {
            id: Date.now(),
            name,
            position,
            photo,
            phone,
            email,
            description
        };

        this.employees.push(employee);
        this.filteredEmployees = [...this.employees];
        this.currentPage = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);

        this.resetForm();
        this.toggleAddForm(false);
        this.render();
        this.showEmployeeDetails(employee.id);
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
        }
        document.querySelectorAll('.validation-message').forEach(el => {
            el.textContent = '';
            el.className = 'validation-message';
        });
        document.querySelectorAll('.invalid-input').forEach(el => el.classList.remove('invalid-input'));
        const submitBtn = document.getElementById('submit-employee-btn');
        if (submitBtn) submitBtn.disabled = true;
    }

    toggleAddForm(forceState) {
        if (!this.formSection) return;
        const shouldShow = typeof forceState === 'boolean' ? forceState : this.formSection.hasAttribute('hidden');
        if (shouldShow) {
            this.formSection.removeAttribute('hidden');
        } else {
            this.formSection.setAttribute('hidden', 'hidden');
        }
    }

    showEmployeeDetails(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (!employee || !this.detailsBlock) return;

        this.detailsBlock.innerHTML = `
            <h3>Детали сотрудника</h3>
            <div class="employee-detail-card">
                <img src="${employee.photo}" alt="${this.escapeHtml(employee.name)}" width="120" height="120">
                <div>
                    <p><strong>ФИО:</strong> ${this.escapeHtml(employee.name)}</p>
                    <p><strong>Должность:</strong> ${this.escapeHtml(employee.position)}</p>
                    <p><strong>Телефон:</strong> ${this.escapeHtml(employee.phone)}</p>
                    <p><strong>Email:</strong> ${this.escapeHtml(employee.email)}</p>
                    <p><strong>Описание работы:</strong> ${this.escapeHtml(employee.description)}</p>
                </div>
            </div>
        `;
    }

    premiateEmployees() {
        if (!this.premiateResult) return;
        const selected = Array.from(this.selectedEmployees)
            .map(id => this.employees.find(e => e.id === id))
            .filter(Boolean)
            .map(emp => (emp.name || '').trim().split(' ')[0] || emp.name);

        if (!selected.length) return;

        const names = selected.join(', ');
        this.premiateResult.innerHTML = `
            <div class="premiate-message">
                <h3>Премирование сотрудников</h3>
                <p>Сотрудники ${this.escapeHtml(names)} получают премию за отличную работу!</p>
                <p>Поздравляем и благодарим за вклад в развитие компании!</p>
            </div>
        `;

        this.selectedEmployees.clear();
        this.render();
    }

    updatePremiateButton() {
        if (this.premiateBtn) {
            this.premiateBtn.disabled = this.selectedEmployees.size === 0;
        }
    }

    syncSelectAllState() {
        if (!this.selectAllCheckbox) return;
        const pageEmployees = this.getCurrentPageEmployees();
        if (!pageEmployees.length) {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = false;
            return;
        }
        const selectedCount = pageEmployees.filter(emp => this.selectedEmployees.has(emp.id)).length;
        this.selectAllCheckbox.checked = selectedCount === pageEmployees.length;
        this.selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < pageEmployees.length;
    }

    highlightRow(row) {
        this.tbody?.querySelectorAll('tr').forEach(tr => tr.classList.remove('selected-row'));
        row.classList.add('selected-row');
    }

    getCurrentPageEmployees() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredEmployees.slice(startIndex, endIndex);
    }

    showPreloader() {
        if (this.preloader) {
            this.preloader.removeAttribute('hidden');
        }
    }

    hidePreloader() {
        if (this.preloader) {
            this.preloader.setAttribute('hidden', 'hidden');
        }
    }

    async applyWithLoader(action) {
        try {
            this.showPreloader();
            await Promise.resolve(action());
        } finally {
            setTimeout(() => this.hidePreloader(), 150);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EmployeesTable();
});


