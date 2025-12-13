/**
 * Валидация возраста
 * Рассчитывает количество полных лет и определяет день недели рождения
 */

class AgeValidator {
    constructor() {
        this.init();
    }

    init() {
        const form = document.getElementById('age-validation-form');
        const checkBtn = document.getElementById('check-age-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateAge();
            });
        }
        
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                this.validateAge();
            });
        }
    }

    validateAge() {
        const dateInput = document.getElementById('birth-date-input');
        const resultDiv = document.getElementById('age-validation-result');
        
        if (!dateInput || !resultDiv) return;

        const birthDateStr = dateInput.value;
        
        if (!birthDateStr) {
            resultDiv.innerHTML = '<div class="error-message">Пожалуйста, введите дату рождения</div>';
            return;
        }

        const birthDate = new Date(birthDateStr);
        const today = new Date();
        
        // Проверка валидности даты
        if (isNaN(birthDate.getTime())) {
            resultDiv.innerHTML = '<div class="error-message">Неверный формат даты</div>';
            return;
        }

        // Проверка, что дата не в будущем
        if (birthDate > today) {
            resultDiv.innerHTML = '<div class="error-message">Дата рождения не может быть в будущем</div>';
            return;
        }

        // Рассчитываем количество полных лет
        const age = this.calculateAge(birthDate, today);
        
        // Определяем день недели
        const dayOfWeek = this.getDayOfWeek(birthDate);
        const dayNames = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
        const dayName = dayNames[dayOfWeek];

        // Формируем результат
        if (age >= 18) {
            resultDiv.innerHTML = `
                <div class="success-message">
                    <h3>Вам ${age} ${this.getAgeWord(age)}</h3>
                    <p>Вы родились в ${dayName}.</p>
                    <p class="adult-message">Добро пожаловать на сайт!</p>
                </div>
            `;
        } else {
            alert(`Вам ${age} ${this.getAgeWord(age)}. Для использования сайта требуется разрешение родителей`);
            resultDiv.innerHTML = `
                <div class="warning-message">
                    <h3>Вам ${age} ${this.getAgeWord(age)}</h3>
                    <p>Вы родились в ${dayName}.</p>
                    <p class="minor-message">⚠️ Для использования сайта требуется разрешение родителей</p>
                </div>
            `;
        }
    }

    calculateAge(birthDate, today) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getDayOfWeek(date) {
        return date.getDay();
    }

    getAgeWord(age) {
        const lastDigit = age % 10;
        const lastTwoDigits = age % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return 'лет';
        }
        
        if (lastDigit === 1) {
            return 'год';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return 'года';
        } else {
            return 'лет';
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new AgeValidator();
});

