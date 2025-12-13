/**
 * Классы для работы с читателями библиотеки (Вариант 19)
 * Поиск самого "старого" читателя библиотеки
 */

// Вариант A: Функциональный стиль с прототипным наследованием
function LibraryReader(lastName, firstName, middleName, startYear, cardNumber) {
    this.lastName = lastName;
    this.firstName = firstName;
    this.middleName = middleName;
    this.startYear = startYear;
    this.cardNumber = cardNumber;
}

LibraryReader.prototype.getFullName = function() {
    return `${this.lastName} ${this.firstName} ${this.middleName}`;
};

LibraryReader.prototype.getReadingExperience = function(currentYear) {
    return currentYear - this.startYear;
};

LibraryReader.prototype.displayInfo = function() {
    const currentYear = new Date().getFullYear();
    return `
        <div class="reader-card">
            <h4>${this.getFullName()}</h4>
            <p><strong>Год начала чтения:</strong> ${this.startYear}</p>
            <p><strong>Стаж чтения:</strong> ${this.getReadingExperience(currentYear)} ${this.getReadingExperience(currentYear) === 1 ? 'год' : 'лет'}</p>
            <p><strong>Номер билета:</strong> ${this.cardNumber}</p>
        </div>
    `;
};

// Наследование через Object.create
function VipLibraryReader(lastName, firstName, middleName, startYear, cardNumber, category, booksRead) {
    LibraryReader.call(this, lastName, firstName, middleName, startYear, cardNumber);
    this.category = category || 'обычный';
    this.booksRead = booksRead || 0;
}

VipLibraryReader.prototype = Object.create(LibraryReader.prototype);
VipLibraryReader.prototype.constructor = VipLibraryReader;

VipLibraryReader.prototype.getReaderStatus = function() {
    const currentYear = new Date().getFullYear();
    const experience = this.getReadingExperience(currentYear);
    
    if (experience >= 20) {
        return 'Почетный читатель';
    } else if (experience >= 10) {
        return 'VIP читатель';
    } else {
        return 'Обычный читатель';
    }
};

VipLibraryReader.prototype.getFullInfo = function() {
    const currentYear = new Date().getFullYear();
    return `
        <div class="reader-card vip-reader">
            <h4>${this.getFullName()}</h4>
            <p><strong>Год начала чтения:</strong> ${this.startYear}</p>
            <p><strong>Стаж чтения:</strong> ${this.getReadingExperience(currentYear)} ${this.getReadingExperience(currentYear) === 1 ? 'год' : 'лет'}</p>
            <p><strong>Номер билета:</strong> ${this.cardNumber}</p>
            <p><strong>Категория:</strong> ${this.category}</p>
            <p><strong>Прочитано книг:</strong> ${this.booksRead}</p>
            <p><strong>Статус:</strong> ${this.getReaderStatus()}</p>
        </div>
    `;
};

// Вариант B: Классы ES6
class LibraryReaderES6 {
    constructor(lastName, firstName, middleName, startYear, cardNumber) {
        this._lastName = lastName;
        this._firstName = firstName;
        this._middleName = middleName;
        this._startYear = startYear;
        this._cardNumber = cardNumber;
    }

    // Геттеры и сеттеры
    get lastName() { return this._lastName; }
    set lastName(value) { this._lastName = value; }
    
    get firstName() { return this._firstName; }
    set firstName(value) { this._firstName = value; }
    
    get middleName() { return this._middleName; }
    set middleName(value) { this._middleName = value; }
    
    get startYear() { return this._startYear; }
    set startYear(value) { this._startYear = value; }
    
    get cardNumber() { return this._cardNumber; }
    set cardNumber(value) { this._cardNumber = value; }

    getFullName() {
        return `${this._lastName} ${this._firstName} ${this._middleName}`;
    }

    getReadingExperience(currentYear) {
        return currentYear - this._startYear;
    }

    displayInfo() {
        const currentYear = new Date().getFullYear();
        return `
            <div class="reader-card">
                <h4>${this.getFullName()}</h4>
                <p><strong>Год начала чтения:</strong> ${this._startYear}</p>
                <p><strong>Стаж чтения:</strong> ${this.getReadingExperience(currentYear)} ${this.getReadingExperience(currentYear) === 1 ? 'год' : 'лет'}</p>
                <p><strong>Номер билета:</strong> ${this._cardNumber}</p>
            </div>
        `;
    }
}

class VipLibraryReaderES6 extends LibraryReaderES6 {
    constructor(lastName, firstName, middleName, startYear, cardNumber, category, booksRead) {
        super(lastName, firstName, middleName, startYear, cardNumber);
        this._category = category || 'обычный';
        this._booksRead = booksRead || 0;
    }

    get category() { return this._category; }
    set category(value) { this._category = value; }
    
    get booksRead() { return this._booksRead; }
    set booksRead(value) { this._booksRead = value; }

    getReaderStatus() {
        const currentYear = new Date().getFullYear();
        const experience = this.getReadingExperience(currentYear);
        
        if (experience >= 20) {
            return 'Почетный читатель';
        } else if (experience >= 10) {
            return 'VIP читатель';
        } else {
            return 'Обычный читатель';
        }
    }

    getFullInfo() {
        const currentYear = new Date().getFullYear();
        return `
            <div class="reader-card vip-reader">
                <h4>${this.getFullName()}</h4>
                <p><strong>Год начала чтения:</strong> ${this._startYear}</p>
                <p><strong>Стаж чтения:</strong> ${this.getReadingExperience(currentYear)} ${this.getReadingExperience(currentYear) === 1 ? 'год' : 'лет'}</p>
                <p><strong>Номер билета:</strong> ${this._cardNumber}</p>
                <p><strong>Категория:</strong> ${this._category}</p>
                <p><strong>Прочитано книг:</strong> ${this._booksRead}</p>
                <p><strong>Статус:</strong> ${this.getReaderStatus()}</p>
            </div>
        `;
    }
}

// Управление читателями
class LibraryManager {
    constructor() {
        this.readers = [];
        this.useES6 = true; // Переключатель между вариантами
        this.init();
    }

    init() {
        // Создаем демо-данные
        this.createDemoData();
        this.renderReaders();
        this.attachEventListeners();
    }

    createDemoData() {
        if (this.useES6) {
            // Используем классы ES6
            this.readers = [
                new VipLibraryReaderES6('Иванов', 'Иван', 'Иванович', 1995, 'LB-001', 'VIP', 150),
                new LibraryReaderES6('Петров', 'Петр', 'Петрович', 2000, 'LB-002'),
                new VipLibraryReaderES6('Сидоров', 'Сидор', 'Сидорович', 1985, 'LB-003', 'почетный', 300),
                new LibraryReaderES6('Козлов', 'Козел', 'Козлович', 2010, 'LB-004'),
                new VipLibraryReaderES6('Смирнов', 'Смирн', 'Смирнович', 1990, 'LB-005', 'VIP', 200),
                new LibraryReaderES6('Васильев', 'Василий', 'Васильевич', 2015, 'LB-006'),
                new VipLibraryReaderES6('Николаев', 'Николай', 'Николаевич', 1980, 'LB-007', 'почетный', 400),
                new LibraryReaderES6('Александров', 'Александр', 'Александрович', 2005, 'LB-008'),
                new VipLibraryReaderES6('Дмитриев', 'Дмитрий', 'Дмитриевич', 1992, 'LB-009', 'VIP', 180),
                new LibraryReaderES6('Андреев', 'Андрей', 'Андреевич', 2018, 'LB-010'),
            ];
        } else {
            // Используем функциональный стиль
            this.readers = [
                new VipLibraryReader('Иванов', 'Иван', 'Иванович', 1995, 'LB-001', 'VIP', 150),
                new LibraryReader('Петров', 'Петр', 'Петрович', 2000, 'LB-002'),
                new VipLibraryReader('Сидоров', 'Сидор', 'Сидорович', 1985, 'LB-003', 'почетный', 300),
                new LibraryReader('Козлов', 'Козел', 'Козлович', 2010, 'LB-004'),
                new VipLibraryReader('Смирнов', 'Смирн', 'Смирнович', 1990, 'LB-005', 'VIP', 200),
                new LibraryReader('Васильев', 'Василий', 'Васильевич', 2015, 'LB-006'),
                new VipLibraryReader('Николаев', 'Николай', 'Николаевич', 1980, 'LB-007', 'почетный', 400),
                new LibraryReader('Александров', 'Александр', 'Александрович', 2005, 'LB-008'),
                new VipLibraryReader('Дмитриев', 'Дмитрий', 'Дмитриевич', 1992, 'LB-009', 'VIP', 180),
                new LibraryReader('Андреев', 'Андрей', 'Андреевич', 2018, 'LB-010'),
            ];
        }
    }

    findOldestReader() {
        if (this.readers.length === 0) return null;
        
        let oldest = this.readers[0];
        for (let i = 1; i < this.readers.length; i++) {
            if (this.readers[i].startYear < oldest.startYear) {
                oldest = this.readers[i];
            }
        }
        
        return oldest;
    }

    renderReaders() {
        const container = document.getElementById('readers-list');
        if (!container) return;

        container.innerHTML = this.readers.map((reader, index) => {
            const isVip = reader instanceof VipLibraryReaderES6 || reader instanceof VipLibraryReader;
            return isVip ? reader.getFullInfo() : reader.displayInfo();
        }).join('');
    }

    attachEventListeners() {
        const findBtn = document.getElementById('find-oldest-btn');
        const addBtn = document.getElementById('add-reader-btn');
        const sortBtn = document.getElementById('sort-readers-btn');
        const searchInput = document.getElementById('search-reader-input');
        const searchBtn = document.getElementById('search-reader-btn');
        const avgBtn = document.getElementById('calculate-avg-btn');
        const vipCheckbox = document.getElementById('new-is-vip');
        const vipFields = document.getElementById('vip-fields');
        const vipBooksField = document.getElementById('vip-books-field');

        if (findBtn) {
            findBtn.addEventListener('click', () => this.showOldestReader());
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddForm());
        }

        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.sortReaders());
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchReader());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchReader();
            });
        }

        if (avgBtn) {
            avgBtn.addEventListener('click', () => this.calculateAverageExperience());
        }

        // Обработчик отправки формы добавления
        const formWrapper = document.getElementById('add-reader-form');
        const form = document.querySelector('#add-reader-form form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addReader();
            });
        }

        // Переключение полей VIP
        if (vipCheckbox && vipFields && vipBooksField) {
            const toggleVipFields = (checked) => {
                vipFields.style.display = checked ? 'block' : 'none';
                vipBooksField.style.display = checked ? 'block' : 'none';
            };
            toggleVipFields(vipCheckbox.checked);
            vipCheckbox.addEventListener('change', (e) => toggleVipFields(e.target.checked));
        }
    }

    showOldestReader() {
        const oldest = this.findOldestReader();
        const resultDiv = document.getElementById('oldest-reader-result');
        
        if (!oldest || !resultDiv) return;

        const currentYear = new Date().getFullYear();
        const experience = oldest.getReadingExperience(currentYear);
        const isVip = oldest instanceof VipLibraryReaderES6 || oldest instanceof VipLibraryReader;
        
        this.setResult('oldest-reader-result', `
            <div class="oldest-reader-card">
                <h3>Самый "старый" читатель библиотеки</h3>
                ${isVip ? oldest.getFullInfo() : oldest.displayInfo()}
                <p class="highlight">Начал читать в ${oldest.startYear} году (${experience} ${experience === 1 ? 'год' : 'лет'} назад)</p>
            </div>
        `);

        // Выделяем в списке
        this.highlightOldest();
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    highlightOldest() {
        const oldest = this.findOldestReader();
        if (!oldest) return;

        const cards = document.querySelectorAll('.reader-card');
        cards.forEach((card, index) => {
            if (this.readers[index] === oldest) {
                card.classList.add('oldest-highlight');
            } else {
                card.classList.remove('oldest-highlight');
            }
        });
    }

    sortReaders() {
        this.readers.sort((a, b) => a.startYear - b.startYear);
        this.renderReaders();
        this.highlightOldest();
    }

    searchReader() {
        const query = document.getElementById('search-reader-input')?.value.toLowerCase();
        if (!query) return;

        const found = this.readers.find(r => 
            r.getFullName().toLowerCase().includes(query) || 
            r.cardNumber.toLowerCase().includes(query)
        );

        if (found) {
            const isVip = found instanceof VipLibraryReaderES6 || found instanceof VipLibraryReader;
            this.setResult('search-reader-result', `
                <div class="search-result">
                    <h4>Найден читатель:</h4>
                    ${isVip ? found.getFullInfo() : found.displayInfo()}
                </div>
            `);
        } else {
            this.setResult('search-reader-result', '<div class="search-result error">Читатель не найден</div>');
        }
        document.getElementById('search-reader-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    calculateAverageExperience() {
        const currentYear = new Date().getFullYear();
        const total = this.readers.reduce((sum, r) => sum + r.getReadingExperience(currentYear), 0);
        const average = Math.round(total / this.readers.length);

        this.setResult('avg-experience-result', `
            <div class="avg-result">
                <h4>Средний стаж чтения</h4>
                <p class="avg-value">${average} ${average === 1 ? 'год' : 'лет'}</p>
            </div>
        `);
        document.getElementById('avg-experience-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showAddForm() {
        const form = document.getElementById('add-reader-form');
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
    }

    addReader() {
        const lastName = document.getElementById('new-last-name')?.value;
        const firstName = document.getElementById('new-first-name')?.value;
        const middleName = document.getElementById('new-middle-name')?.value;
        const startYear = parseInt(document.getElementById('new-start-year')?.value);
        const cardNumber = document.getElementById('new-card-number')?.value;
        const isVip = document.getElementById('new-is-vip')?.checked;
        const category = document.getElementById('new-category')?.value;
        const booksRead = parseInt(document.getElementById('new-books-read')?.value) || 0;

        if (!lastName || !firstName || !middleName || !startYear || !cardNumber) {
            alert('Заполните все обязательные поля');
            return;
        }

        let newReader;
        if (this.useES6) {
            if (isVip) {
                newReader = new VipLibraryReaderES6(lastName, firstName, middleName, startYear, cardNumber, category, booksRead);
            } else {
                newReader = new LibraryReaderES6(lastName, firstName, middleName, startYear, cardNumber);
            }
        } else {
            if (isVip) {
                newReader = new VipLibraryReader(lastName, firstName, middleName, startYear, cardNumber, category, booksRead);
            } else {
                newReader = new LibraryReader(lastName, firstName, middleName, startYear, cardNumber);
            }
        }

        this.readers.push(newReader);
        this.renderReaders();
        
        // Очищаем форму
        const formEl = document.querySelector('#add-reader-form form');
        const wrapper = document.getElementById('add-reader-form');
        if (formEl) formEl.reset();
        if (wrapper) wrapper.style.display = 'none';
        // Сообщение об успехе
        this.setResult('search-reader-result', '<div class="search-result success">Читатель добавлен</div>');
        document.getElementById('readers-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setResult(containerId, html) {
        const div = document.getElementById(containerId);
        if (div) {
            div.innerHTML = html;
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('readers-list')) {
        new LibraryManager();
    }
});

